import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { WebhookService } from './webhook.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webhookService: WebhookService,
  ) {}

  /**
   * Yeni etkinlik oluşturur.
   */
  async create(createEventDto: CreateEventDto, organizerId: string) {
    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        eventDate: new Date(createEventDto.eventDate),
        organizerId,
      },
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            university: true,
          },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    // Webhook'u asenkron olarak gönder (ana akışı bloklamaz)
    this.webhookService.sendEventCreatedWebhook(event).catch(() => {});

    return event;
  }

  /**
   * Etkinlikleri pagination, filtering ve sorting ile listeler.
   */
  async findAll(query: QueryEventDto) {
    const { page = 1, limit = 10, category, city, sort = 'createdAt', order = 'desc' } = query;

    const skip = (page - 1) * limit;

    // Filtre oluştur
    const where: any = {};
    if (category) where.category = category;
    if (city) where.city = city;

    // Sıralama
    const orderBy: any = {};
    orderBy[sort] = order;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          organizer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              university: true,
            },
          },
          _count: {
            select: { participants: true },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * ID ile tekil etkinlik getirir.
   */
  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            university: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`ID '${id}' ile etkinlik bulunamadı.`);
    }

    return event;
  }

  /**
   * Etkinliği günceller (sadece organizör güncelleyebilir).
   */
  async update(id: string, updateEventDto: UpdateEventDto, userId: string) {
    const event = await this.findOne(id);

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Bu etkinliği sadece organizör güncelleyebilir.');
    }

    const data: any = { ...updateEventDto };
    if (updateEventDto.eventDate) {
      data.eventDate = new Date(updateEventDto.eventDate);
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data,
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            university: true,
          },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    return updated;
  }

  /**
   * Etkinliği siler (sadece organizör silebilir).
   */
  async remove(id: string, userId: string) {
    const event = await this.findOne(id);

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Bu etkinliği sadece organizör silebilir.');
    }

    await this.prisma.event.delete({ where: { id } });

    return { message: `ID '${id}' ile etkinlik başarıyla silindi.` };
  }

  /**
   * Etkinliğe katıl.
   */
  async joinEvent(eventId: string, userId: string) {
    const event = await this.findOne(eventId);

    // Zaten katılmış mı kontrol et
    const existing = await this.prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existing) {
      throw new ConflictException('Bu etkinliğe zaten katıldınız.');
    }

    // Kapasite kontrol
    if (event.maxParticipants > 0) {
      const currentCount = await this.prisma.eventParticipant.count({
        where: { eventId },
      });
      if (currentCount >= event.maxParticipants) {
        throw new ConflictException('Etkinlik kapasitesi dolu.');
      }
    }

    await this.prisma.eventParticipant.create({
      data: { userId, eventId },
    });

    return { message: 'Etkinliğe başarıyla katıldınız.', eventId, userId };
  }

  /**
   * Etkinlikten ayrıl.
   */
  async leaveEvent(eventId: string, userId: string) {
    const participation = await this.prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (!participation) {
      throw new NotFoundException('Bu etkinliğe katılmamışsınız.');
    }

    await this.prisma.eventParticipant.delete({
      where: { id: participation.id },
    });

    return { message: 'Etkinlikten başarıyla ayrıldınız.', eventId, userId };
  }

  /**
   * Kullanıcının katıldığı etkinlikleri getirir.
   */
  async getMyEvents(userId: string) {
    const participations = await this.prisma.eventParticipant.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                university: true,
              },
            },
            _count: {
              select: { participants: true },
            },
          },
        },
      },
    });

    return participations.map((p) => ({
      ...p.event,
      joinedAt: p.joinedAt,
    }));
  }
}

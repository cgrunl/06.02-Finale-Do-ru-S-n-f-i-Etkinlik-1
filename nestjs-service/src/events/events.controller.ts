import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni etkinlik oluştur (JWT gerekli)' })
  @ApiResponse({ status: 201, description: 'Etkinlik oluşturuldu.' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim.' })
  create(@Body() createEventDto: CreateEventDto, @GetUser('id') userId: string) {
    return this.eventsService.create(createEventDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Etkinlikleri listele (Pagination, Filter, Sort)' })
  @ApiResponse({ status: 200, description: 'Etkinlik listesi.' })
  findAll(@Query() query: QueryEventDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile etkinlik detayı' })
  @ApiParam({ name: 'id', description: 'Etkinlik UUID' })
  @ApiResponse({ status: 200, description: 'Etkinlik detayı.' })
  @ApiResponse({ status: 404, description: 'Etkinlik bulunamadı.' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Etkinliği güncelle (JWT gerekli, sadece organizör)' })
  @ApiParam({ name: 'id', description: 'Etkinlik UUID' })
  @ApiResponse({ status: 200, description: 'Etkinlik güncellendi.' })
  @ApiResponse({ status: 403, description: 'Sadece organizör güncelleyebilir.' })
  @ApiResponse({ status: 404, description: 'Etkinlik bulunamadı.' })
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser('id') userId: string,
  ) {
    return this.eventsService.update(id, updateEventDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Etkinliği sil (JWT gerekli, sadece organizör)' })
  @ApiParam({ name: 'id', description: 'Etkinlik UUID' })
  @ApiResponse({ status: 200, description: 'Etkinlik silindi.' })
  @ApiResponse({ status: 403, description: 'Sadece organizör silebilir.' })
  @ApiResponse({ status: 404, description: 'Etkinlik bulunamadı.' })
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.eventsService.remove(id, userId);
  }
}

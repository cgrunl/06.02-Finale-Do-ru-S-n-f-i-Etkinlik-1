import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EventsService } from '../events.service';
import { EventType, JoinLeaveResponseType } from './event.types';
import { GqlAuthGuard } from './gql-auth.guard';

@Resolver(() => EventType)
export class EventsResolver {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Tüm etkinlikleri getirir (N+1 sorunu Prisma include ile engellenir).
   */
  @Query(() => [EventType], { name: 'events', description: 'Tüm etkinlikleri listele' })
  async getEvents() {
    const result = await this.eventsService.findAll({
      page: 1,
      limit: 100,
      sort: 'createdAt',
      order: 'desc',
    });
    return result.data;
  }

  /**
   * Giriş yapmış kullanıcının katıldığı etkinlikleri getirir.
   */
  @Query(() => [EventType], { name: 'myEvents', description: 'Katıldığım etkinlikler' })
  @UseGuards(GqlAuthGuard)
  async getMyEvents(@Context() context: any) {
    const userId = context.req.user.id;
    return this.eventsService.getMyEvents(userId);
  }

  /**
   * Etkinliğe katıl.
   */
  @Mutation(() => JoinLeaveResponseType, { name: 'joinEvent', description: 'Etkinliğe katıl' })
  @UseGuards(GqlAuthGuard)
  async joinEvent(
    @Args('eventId') eventId: string,
    @Context() context: any,
  ) {
    const userId = context.req.user.id;
    return this.eventsService.joinEvent(eventId, userId);
  }

  /**
   * Etkinlikten ayrıl.
   */
  @Mutation(() => JoinLeaveResponseType, { name: 'leaveEvent', description: 'Etkinlikten ayrıl' })
  @UseGuards(GqlAuthGuard)
  async leaveEvent(
    @Args('eventId') eventId: string,
    @Context() context: any,
  ) {
    const userId = context.req.user.id;
    return this.eventsService.leaveEvent(eventId, userId);
  }
}

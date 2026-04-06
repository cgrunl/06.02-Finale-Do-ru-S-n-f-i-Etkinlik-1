import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  university?: string;

  @Field({ nullable: true })
  department?: string;
}

@ObjectType()
export class ParticipantCountType {
  @Field(() => Int)
  participants: number;
}

@ObjectType()
export class EventType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  category: string;

  @Field()
  city: string;

  @Field({ nullable: true })
  location?: string;

  @Field()
  eventDate: Date;

  @Field(() => Int)
  maxParticipants: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  organizerId: string;

  @Field(() => UserType, { nullable: true })
  organizer?: UserType;

  @Field(() => ParticipantCountType, { nullable: true })
  _count?: ParticipantCountType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  joinedAt?: Date;
}

@ObjectType()
export class JoinLeaveResponseType {
  @Field()
  message: string;

  @Field()
  eventId: string;

  @Field()
  userId: string;
}

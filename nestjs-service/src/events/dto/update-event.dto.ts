import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Güncellenmiş Başlık' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Güncellenmiş açıklama...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Spor' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'İstanbul' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Yeni Lokasyon' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: '2026-06-20T14:00:00Z' })
  @IsDateString({}, { message: 'Geçerli bir tarih formatı giriniz (ISO 8601).' })
  @IsOptional()
  eventDate?: string;

  @ApiPropertyOptional({ example: 200 })
  @IsInt()
  @Min(0)
  @IsOptional()
  maxParticipants?: number;

  @ApiPropertyOptional({ example: 'https://example.com/new-image.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

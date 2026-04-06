import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Yapay Zeka Konferansı', description: 'Etkinlik başlığı' })
  @IsString()
  @IsNotEmpty({ message: 'Etkinlik başlığı zorunludur.' })
  title: string;

  @ApiPropertyOptional({ example: 'Yapay zeka alanında son gelişmeler...', description: 'Etkinlik açıklaması' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Teknoloji', description: 'Etkinlik kategorisi' })
  @IsString()
  @IsNotEmpty({ message: 'Kategori zorunludur.' })
  category: string;

  @ApiProperty({ example: 'Bitlis', description: 'Şehir' })
  @IsString()
  @IsNotEmpty({ message: 'Şehir zorunludur.' })
  city: string;

  @ApiPropertyOptional({ example: 'BEÜ Konferans Salonu', description: 'Etkinlik lokasyonu' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '2026-05-15T10:00:00Z', description: 'Etkinlik tarihi (ISO 8601)' })
  @IsDateString({}, { message: 'Geçerli bir tarih formatı giriniz (ISO 8601).' })
  @IsNotEmpty({ message: 'Etkinlik tarihi zorunludur.' })
  eventDate: string;

  @ApiPropertyOptional({ example: 100, description: 'Maksimum katılımcı sayısı' })
  @IsInt({ message: 'Maksimum katılımcı sayısı tam sayı olmalıdır.' })
  @Min(0)
  @IsOptional()
  maxParticipants?: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg', description: 'Etkinlik görseli URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

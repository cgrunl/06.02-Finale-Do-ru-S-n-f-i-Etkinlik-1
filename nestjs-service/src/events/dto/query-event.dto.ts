import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryEventDto {
  @ApiPropertyOptional({ example: 1, description: 'Sayfa numarası', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Sayfa başına kayıt', default: 10 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'Teknoloji', description: 'Kategori filtresi' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'Bitlis', description: 'Şehir filtresi' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'eventDate', description: 'Sıralama alanı', enum: ['title', 'eventDate', 'createdAt', 'city', 'category'] })
  @IsString()
  @IsIn(['title', 'eventDate', 'createdAt', 'city', 'category'])
  @IsOptional()
  sort?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', description: 'Sıralama yönü', enum: ['asc', 'desc'] })
  @IsString()
  @IsIn(['asc', 'desc'])
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}

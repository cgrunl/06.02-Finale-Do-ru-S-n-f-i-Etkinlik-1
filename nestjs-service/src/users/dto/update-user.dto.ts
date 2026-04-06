import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'yeni@beu.edu.tr', description: 'Yeni e-posta adresi' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'YeniSifre123!', description: 'Yeni şifre (min 6 karakter)' })
  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'Ahmet', description: 'Yeni ad' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Kaya', description: 'Yeni soyad' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'İstanbul Üniversitesi', description: 'Yeni üniversite' })
  @IsString()
  @IsOptional()
  university?: string;

  @ApiPropertyOptional({ example: 'Yazılım Mühendisliği', description: 'Yeni bölüm' })
  @IsString()
  @IsOptional()
  department?: string;
}

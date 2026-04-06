import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'furkan@beu.edu.tr', description: 'Kullanıcı e-posta adresi (unique)' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  @IsNotEmpty({ message: 'E-posta adresi zorunludur.' })
  email: string;

  @ApiProperty({ example: 'Sifre123!', description: 'Kullanıcı şifresi (min 6 karakter)' })
  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  @IsNotEmpty({ message: 'Şifre zorunludur.' })
  password: string;

  @ApiProperty({ example: 'Furkan', description: 'Kullanıcı adı' })
  @IsString()
  @IsNotEmpty({ message: 'Ad zorunludur.' })
  firstName: string;

  @ApiProperty({ example: 'Yılmaz', description: 'Kullanıcı soyadı' })
  @IsString()
  @IsNotEmpty({ message: 'Soyad zorunludur.' })
  lastName: string;

  @ApiPropertyOptional({ example: 'Bitlis Eren Üniversitesi', description: 'Üniversite adı' })
  @IsString()
  @IsOptional()
  university?: string;

  @ApiPropertyOptional({ example: 'Bilgisayar Mühendisliği', description: 'Bölüm adı' })
  @IsString()
  @IsOptional()
  department?: string;
}

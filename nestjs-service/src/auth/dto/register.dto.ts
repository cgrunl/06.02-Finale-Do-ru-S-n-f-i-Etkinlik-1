import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'furkan@beu.edu.tr', description: 'E-posta adresi' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  @IsNotEmpty({ message: 'E-posta adresi zorunludur.' })
  email: string;

  @ApiProperty({ example: 'Sifre123!', description: 'Şifre (min 6 karakter)' })
  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  @IsNotEmpty({ message: 'Şifre zorunludur.' })
  password: string;

  @ApiProperty({ example: 'Furkan', description: 'Ad' })
  @IsString()
  @IsNotEmpty({ message: 'Ad zorunludur.' })
  firstName: string;

  @ApiProperty({ example: 'Yılmaz', description: 'Soyad' })
  @IsString()
  @IsNotEmpty({ message: 'Soyad zorunludur.' })
  lastName: string;

  @ApiProperty({ example: 'Bitlis Eren Üniversitesi', description: 'Üniversite', required: false })
  @IsString()
  @IsOptional()
  university?: string;

  @ApiProperty({ example: 'Bilgisayar Mühendisliği', description: 'Bölüm', required: false })
  @IsString()
  @IsOptional()
  department?: string;
}

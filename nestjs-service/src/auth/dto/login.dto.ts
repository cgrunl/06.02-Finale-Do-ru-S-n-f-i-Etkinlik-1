import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'furkan@beu.edu.tr', description: 'E-posta adresi' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  @IsNotEmpty({ message: 'E-posta adresi zorunludur.' })
  email: string;

  @ApiProperty({ example: 'Sifre123!', description: 'Şifre' })
  @IsString()
  @IsNotEmpty({ message: 'Şifre zorunludur.' })
  password: string;
}

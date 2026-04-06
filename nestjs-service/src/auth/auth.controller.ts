import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı oluştur' })
  @ApiResponse({ status: 201, description: 'Kayıt başarılı, JWT token döner.' })
  @ApiResponse({ status: 409, description: 'E-posta adresi zaten kayıtlı.' })
  @ApiResponse({ status: 400, description: 'Validasyon hatası.' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı giriş yap' })
  @ApiResponse({ status: 200, description: 'Giriş başarılı, JWT token döner.' })
  @ApiResponse({ status: 401, description: 'E-posta adresi veya şifre hatalı.' })
  @ApiResponse({ status: 400, description: 'Validasyon hatası.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}

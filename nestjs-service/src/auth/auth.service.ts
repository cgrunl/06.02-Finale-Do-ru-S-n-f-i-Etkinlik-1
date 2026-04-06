import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Yeni kullanıcı kaydı oluşturur ve JWT token döner.
   */
  async register(registerDto: RegisterDto) {
    // Kullanıcıyı oluştur (UsersService email unique kontrolü yapar)
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      university: registerDto.university,
      department: registerDto.department,
    });

    // JWT token oluştur
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Kayıt başarılı.',
      user,
      accessToken,
    };
  }

  /**
   * Kullanıcı giriş yapar ve JWT token döner.
   */
  async login(loginDto: LoginDto) {
    // Kullanıcıyı email ile bul
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('E-posta adresi veya şifre hatalı.');
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta adresi veya şifre hatalı.');
    }

    // JWT token oluştur
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    // Şifreyi çıkar
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Giriş başarılı.',
      user: userWithoutPassword,
      accessToken,
    };
  }
}

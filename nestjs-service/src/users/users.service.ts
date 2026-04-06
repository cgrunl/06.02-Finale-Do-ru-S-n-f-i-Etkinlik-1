import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Yeni kullanıcı oluşturur.
   * Email zaten kayıtlıysa 409 Conflict döner.
   */
  async create(createUserDto: CreateUserDto) {
    // Email unique kontrolü
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `'${createUserDto.email}' e-posta adresi zaten kayıtlı.`,
      );
    }

    // Şifreyi bcrypt ile hashle
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    // Şifreyi response'dan çıkar
    const { password, ...result } = user;
    return result;
  }

  /**
   * Tüm kullanıcıları listeler (şifre hariç).
   */
  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        university: true,
        department: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  /**
   * ID ile tekil kullanıcı getirir.
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        university: true,
        department: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`ID '${id}' ile kullanıcı bulunamadı.`);
    }

    return user;
  }

  /**
   * Email ile kullanıcı bulur (auth için, şifre dahil).
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Kullanıcı bilgilerini günceller.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Kullanıcı var mı kontrol et
    await this.findOne(id);

    // Eğer email güncellenmişse, çakışma kontrolü
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          `'${updateUserDto.email}' e-posta adresi zaten kayıtlı.`,
        );
      }
    }

    // Eğer şifre güncellenmişse, hashle
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    const { password, ...result } = user;
    return result;
  }

  /**
   * Kullanıcıyı siler.
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: `ID '${id}' ile kullanıcı başarıyla silindi.` };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur' })
  @ApiResponse({ status: 201, description: 'Kullanıcı başarıyla oluşturuldu.' })
  @ApiResponse({ status: 409, description: 'E-posta adresi zaten kayıtlı.' })
  @ApiResponse({ status: 400, description: 'Validasyon hatası.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm kullanıcıları listele' })
  @ApiResponse({ status: 200, description: 'Kullanıcı listesi.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile kullanıcı detayı' })
  @ApiParam({ name: 'id', description: 'Kullanıcı UUID' })
  @ApiResponse({ status: 200, description: 'Kullanıcı detayı.' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Kullanıcı bilgilerini güncelle' })
  @ApiParam({ name: 'id', description: 'Kullanıcı UUID' })
  @ApiResponse({ status: 200, description: 'Kullanıcı güncellendi.' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı.' })
  @ApiResponse({ status: 409, description: 'E-posta adresi zaten kayıtlı.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcıyı sil' })
  @ApiParam({ name: 'id', description: 'Kullanıcı UUID' })
  @ApiResponse({ status: 200, description: 'Kullanıcı silindi.' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

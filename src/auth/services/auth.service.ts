import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.userRepository.findOneBy({ phone: dto.phone });
    if (existingUser) throw new Error('Пользователь с таким телефоном уже существует');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      role: UserRole.USER
    });

    await this.userRepository.save(newUser);

    return { message: 'Регистрация успешна' };
  }


  async login(phone: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOneBy({ phone });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный пароль');
    }

    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}

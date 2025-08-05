import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ phone });
  }

  async getStaff(): Promise<User[]> {
    return await this.userRepository.find({
      where: [
        { role: UserRole.ADMIN },
        { role: UserRole.FLORIST },
      ],
      // select: ['id', 'firstName', 'lastName', 'phone', 'email', 'role', 'bonusPoints', 'totalOrders', 'createdAt'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);

    if (updateUserDto.email !== undefined && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOneBy({ email: updateUserDto.email });
      if (existingEmail) {
        throw new ConflictException('Пользователь с таким email уже существует');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.phone !== undefined && updateUserDto.phone !== user.phone) {
      const existingPhone = await this.userRepository.findOneBy({ phone: updateUserDto.phone });
      if (existingPhone) {
        throw new ConflictException('Пользователь с таким телефоном уже существует');
      }
      user.phone = updateUserDto.phone;
    }

    if (updateUserDto.firstName !== undefined) {
      user.firstName = updateUserDto.firstName;
    }

    if (updateUserDto.lastName !== undefined) {
      user.lastName = updateUserDto.lastName;
    }

    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateUserRole(id: number, newRole: UserRole): Promise<User> {
    const user = await this.findOneById(id);

    // if (user.id === id) {
    //   throw new ConflictException('Нельзя изменить роль самого себя');
    // }

    if (!Object.values(UserRole).includes(newRole)) {
      throw new ConflictException('Неизвестная роль');
    }

    user.role = newRole;
    return await this.userRepository.save(user);
  }
}
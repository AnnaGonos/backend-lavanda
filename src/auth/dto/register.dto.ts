import { IsString, IsEmail, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'Неверный формат email' })
  email?: string;

  @IsString()
  password: string;
}

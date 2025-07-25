import { UserRole } from '../entities/user-role.enum';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  @Transform(({ value }) => value.toLowerCase())
  role: UserRole;
}

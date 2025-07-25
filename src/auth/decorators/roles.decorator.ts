import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);



// import { UseGuards } from '@nestjs/common';
// import { RolesGuard } from '../guards/roles.guard';
// import { JwtAuthGuard } from '../guards/jwt-auth.guard';
//
// export const AuthRole = (...roles: string[]) => UseGuards(JwtAuthGuard, RolesGuard);
//

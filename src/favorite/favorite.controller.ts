import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Favorite } from './entities/favorite.entity';

@Controller('api/favorites')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  // @Post('/add')
  // async addToFavorite(
  //   @Request() req,
  //   @Body('productId', ParseIntPipe) productId: number,
  // ): Promise<Favorite> {
  //   const userId = req.user.id;
  //   return this.favoriteService.addToFavorite(userId, productId);
  // }

  @Post('/toggle')
  async toggleFavorite(
    @Request() req,
    @Body('productId') productId: number
  ) {
    const userId = req.user.id;

    const existing = await this.favoriteService.isFavorite(userId, productId);

    if (existing) {
      await this.favoriteService.removeFromFavoriteByUserAndProduct(userId, productId);
      return {
        isFavorite: false,
        productId,
        message: 'Товар удален из избранного'
      };
    } else {
      await this.favoriteService.addToFavorite(userId, productId);
      return {
        isFavorite: true,
        productId,
        message: 'Товар добавлен в избранное'
      };
    }
  }

  @Get('/')
  async getUserFavorites(@Request() req): Promise<Favorite[]> {
    const userId = req.user.id;
    return this.favoriteService.getFavoritesByUser(userId);
  }

  @Delete('/remove')
  async removeFromFavoriteByUserAndProduct(
    @Request() req,
    @Body('productId', ParseIntPipe) productId: number,
  ) {
    const userId = req.user.id;
    await this.favoriteService.removeFromFavoriteByUserAndProduct(
      userId,
      productId,
    );
    return { message: 'Товар удален из избранного' };
  }
}

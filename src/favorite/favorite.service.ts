import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Favorite } from './entities/favorite.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Product } from '../productpublic/entities/product.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async addToFavorite(userId: number, productId: number): Promise<Favorite> {
    const [user, product] = await Promise.all([
      this.userRepository.findOneBy({ id: userId }),
      this.productRepository.findOneBy({ id: productId })
    ]);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    return await this.favoriteRepository.save({ user, product });
  }

  async removeFromFavorite(id: number): Promise<void> {
    await this.favoriteRepository.delete(id);
  }

  async removeFromFavoriteByUserAndProduct(userId: number, productId: number): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId }
      }
    });

    if (!favorite) {
      throw new NotFoundException('Товар не найден в избранном');
    }

    await this.favoriteRepository.remove(favorite);
  }

  async getFavoritesByUser(userId: number, page = 1, limit = 10): Promise<Favorite[]> {
    const [favorites] = await this.favoriteRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['product'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return favorites;
  }

  async isFavorite(userId: number, productId: number): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId }
      }
    });

    return !!favorite;
  }
}

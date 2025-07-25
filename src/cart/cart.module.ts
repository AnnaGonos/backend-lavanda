import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entities/cart.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Product } from '../productpublic/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, User, Product]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}

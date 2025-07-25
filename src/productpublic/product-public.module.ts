import { Module } from '@nestjs/common';
import { ProductPublicService } from './product-public.service';
import { ProductPublicController } from './product-public.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [ProductPublicController],
  providers: [ProductPublicService],
  exports: [ProductPublicService]
})
export class ProductPublicModule {}

import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from '../productpublic/entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudService } from '../cloud/cloud.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), AuthModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    CloudService, JwtAuthGuard
  ],
  exports: [ProductService],
})
export class ProductModule {}

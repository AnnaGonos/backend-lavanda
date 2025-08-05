import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../productpublic/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { ProductService } from '../product/product.service';
import { CloudService } from '../cloud/cloud.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Product, User]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService,
    ProductService,
    CloudService
  ],
})
export class ReviewModule {}

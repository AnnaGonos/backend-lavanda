import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import AppDataSource from './typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ReviewModule } from './review/review.module';
import { CartModule } from './cart/cart.module';
import { FavoriteModule } from './favorite/favorite.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { AuthModule } from './auth/auth.module';
import { CloudModule } from './cloud/cloud.module';
import { ProductPublicModule } from './productpublic/product-public.module';

@Module({
  imports: [
    ProductModule,
    TypeOrmModule.forRoot(AppDataSource.options),
    ReviewModule,
    UserModule,
    CartModule,
    FavoriteModule,
    OrderModule,
    PaymentModule,
    AuthModule,
    CloudModule,
    ProductPublicModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

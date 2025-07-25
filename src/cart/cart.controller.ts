import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Request,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('/add')
  async addToCart(@Body() dto: AddToCartDto, @Request() req) {
    const userId = req.user.id;
    return this.cartService.addToCart(userId, dto.productId, dto.quantity);
  }

  @Put('/item/:id')
  async updateQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.cartService.updateCartItem(id, quantity, userId);
  }

  @Patch('/item/:id/decrement')
  async decrementQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.cartService.decrementCartItem(id, userId);
  }

  @Patch('/item/:id/increment')
  async incrementQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.cartService.incrementCartItem(id, userId);
  }

  @Delete('/item/:id')
  async removeCartItem(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    return this.cartService.removeCartItem(id, userId);
  }

  @Delete('/clear')
  async clearCart(@Request() req) {
    const userId = req.user.id;
    return this.cartService.clearCart(userId);
  }

  @Get('/')
  async getUserCart(@Request() req) {
    const userId = req.user.id;
    return this.cartService.getCartByUser(userId);
  }
}

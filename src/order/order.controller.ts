import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/create-from-cart')
  async createFromCart(@Request() req, @Body() createOrderDto: any) {
    const userId = req.user.id;
    return this.orderService.createFromCart(userId, createOrderDto);
  }

  @Get('/my')
  async getMyOrders(@Request() req) {
    const userId = req.user.id;
    return this.orderService.getOrdersByUser(userId);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.orderService.getOrderById(+id, userId);
  }
}

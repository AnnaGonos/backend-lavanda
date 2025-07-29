import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user-role.enum';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

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
  async getMyOrders(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.id;
    const safeLimit = limit > 50 ? 50 : limit;
    return this.orderService.getOrdersByUser(userId, page, safeLimit);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.orderService.getOrderById(+id, userId);
  }

  @Get('/admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FLORIST)
  async getAllOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('deliveryDateFrom') deliveryDateFrom?: string,
    @Query('deliveryDateTo') deliveryDateTo?: string,
    @Query('sortBy') sortBy?: 'createdAt' | 'deliveryDate',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const validatedSortBy = (sortBy === 'createdAt' || sortBy === 'deliveryDate') ? sortBy : 'createdAt';
    const validatedSortOrder = (sortOrder === 'ASC' || sortOrder === 'DESC') ? sortOrder : 'DESC';

    return this.orderService.getOrdersWithPagination(
      page,
      limit,
      status,
      deliveryDateFrom,
      deliveryDateTo,
      validatedSortBy,
      validatedSortOrder
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FLORIST)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(+id, updateStatusDto.status);
  }

  @Get('/admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FLORIST)
  async getOrderByIdAdmin(@Param('id') id: string) {
    return this.orderService.getOrderByIdAdmin(+id);
  }
}

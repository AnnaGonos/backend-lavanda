import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Repository, Raw } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../productpublic/entities/product.entity';
import { Payment } from '../payment/entities/payment.entity';
import { OrderStatus } from './entities/order-status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async createFromCart(userId: number, orderData: any): Promise<Order> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('Пользователь не найден');

    const cartItems = await this.cartRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });

    if (cartItems.length === 0) {
      throw new Error('Корзина пуста');
    }

    let totalAmount = 0;
    for (const cartItem of cartItems) {
      const price = cartItem.product.discount || cartItem.product.price;
      totalAmount += price * cartItem.quantity;
    }

    if (orderData.deliveryMethod === 'доставка') {
      totalAmount += 400;
    }

    const bonusToUse = orderData.useBonusPoints ? Number(orderData.useBonusPoints) : 0;
    if (bonusToUse > 0) {
      if (bonusToUse > user.bonusPoints) {
        throw new Error('Недостаточно бонусов для списания');
      }
      if (bonusToUse > totalAmount) {
        throw new Error('Нельзя списать больше, чем сумма заказа');
      }
      totalAmount -= bonusToUse;
    }

    const orderNumber = await this.generateOrderNumber();

    const order = this.orderRepository.create({
      orderNumber,
      deliveryMethod: orderData.deliveryMethod || 'самовывоз',
      comment: orderData.comment,
      recipientName: orderData.recipientName,
      recipientPhone: orderData.recipientPhone,
      deliveryAddress: orderData.deliveryAddress,
      deliveryDate: orderData.deliveryDate,
      deliveryPeriod: orderData.deliveryPeriod,
      totalAmount,
      status: OrderStatus.CREATED,
      user,
    });

    const savedOrder = await this.orderRepository.save(order);

    const orderItemsToSave: OrderItem[] = [];
    for (const cartItem of cartItems) {
      const product = cartItem.product;

      if (cartItem.quantity > product.stock) {
        throw new Error(`Товар "${product.name}" временно недоступен в таком количестве`);
      }

      const orderItem = this.orderItemRepository.create({
        quantity: cartItem.quantity,
        price: product.price,
        discount: product.discount ?? undefined,
        product,
        order: savedOrder,
      });

      orderItemsToSave.push(orderItem);
    }

    await this.orderItemRepository.save(orderItemsToSave);

    const payment = this.paymentRepository.create({
      order: savedOrder,
      method: orderData.paymentMethod || 'cash',
      isPaid: orderData.paymentMethod === 'cash',
      amount: totalAmount,
      paidAt: orderData.paymentMethod === 'cash' ? new Date() : undefined,
    });

    await this.paymentRepository.save(payment);
    savedOrder.payment = payment;
    await this.orderRepository.save(savedOrder);

    if (payment.isPaid) {
      const bonusRate = user.bonusCardLevel * 0.01;
      const earnedBonus = Math.floor(totalAmount * bonusRate);
      user.bonusPoints += earnedBonus;
      user.totalOrders += 1;
    }

    if (bonusToUse > 0) {
      user.bonusPoints -= bonusToUse;
    }

    await this.userRepository.save(user);

    for (const cartItem of cartItems) {
      const product = cartItem.product;
      product.stock -= cartItem.quantity;
      await this.productRepository.save(product);
    }

    await this.cartRepository.remove(cartItems);

    savedOrder.items = orderItemsToSave;
    return savedOrder;
  }

  // прим: 250423-001
  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    const count = await this.orderRepository.count({
      where: {
        createdAt: Raw(() => `DATE("createdAt") = DATE('${now.toISOString().split('T')[0]}')`),
      },
    });

    const number = String(count + 1).padStart(3, '0');
    return `${datePrefix}-${number}`;
  }

  async getOrdersByUser(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'payment'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(orderId: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'payment', 'user'],
    });

    if (!order) throw new Error('Заказ не найден');
    if (order.user.id !== userId) throw new Error('Нет доступа к заказу');

    return order;
  }

  async getAllOrders() {
    return await this.orderRepository.find({
      relations: ['items', 'items.product', 'payment', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderByIdAdmin(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'payment', 'user'],
    });

    if (!order) {
      throw new Error('Заказ не найден');
    }

    return order;
  }

  async getOrdersWithPagination(
    page: number = 1,
    limit: number = 20,
    status?: string,
    deliveryDateFrom?: string,
    deliveryDateTo?: string,
    sortBy: 'createdAt' | 'deliveryDate' = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository.createQueryBuilder('order');
    queryBuilder.leftJoinAndSelect('order.user', 'user');
    queryBuilder.leftJoinAndSelect('order.items', 'items');
    queryBuilder.leftJoinAndSelect('items.product', 'product');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (deliveryDateFrom || deliveryDateTo) {
      if (deliveryDateFrom && deliveryDateTo) {
        queryBuilder.andWhere('order.deliveryDate BETWEEN :dateFrom AND :dateTo', {
          dateFrom: deliveryDateFrom,
          dateTo: deliveryDateTo,
        });
      } else if (deliveryDateFrom) {
        queryBuilder.andWhere('order.deliveryDate >= :dateFrom', {
          dateFrom: deliveryDateFrom,
        });
      } else if (deliveryDateTo) {
        queryBuilder.andWhere('order.deliveryDate <= :dateTo', {
          dateTo: deliveryDateTo,
        });
      }
    }

    const allowedSortFields: (keyof Order)[] = ['createdAt', 'deliveryDate'];
    const orderField = allowedSortFields.includes(sortBy) ? `order.${sortBy}` : 'order.createdAt';

    queryBuilder.orderBy(orderField, sortOrder);

    const [orders, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }


  async updateOrderStatus(orderId: number, newStatus: OrderStatus) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user']
    });

    if (!order) {
      throw new NotFoundException(`Заказ с ID ${orderId} не найден`);
    }

    const isValidTransition = this.isValidStatusTransition(order.status, newStatus);

    if (!isValidTransition) {
      throw new ForbiddenException(
        `Недопустимый переход статуса: из "${order.status}" в "${newStatus}"`
      );
    }

    order.status = newStatus;
    return this.orderRepository.save(order);
  }

  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.CREATED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.ASSEMBLED, OrderStatus.CANCELLED],
      [OrderStatus.ASSEMBLED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: []
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }
}

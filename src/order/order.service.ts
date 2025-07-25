import { Injectable } from '@nestjs/common';
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
      status: 'created',
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

    // Уменьшаем остатки
    for (const cartItem of cartItems) {
      const product = cartItem.product;
      product.stock -= cartItem.quantity;
      await this.productRepository.save(product);
    }

    // Очищаем корзину
    await this.cartRepository.remove(cartItems);

    savedOrder.items = orderItemsToSave;
    return savedOrder;
  }

  // Генерация номера заказа: 250423-001
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

  // Получить все заказы пользователя
  async getOrdersByUser(userId: number) {
    return await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  // Получить заказ по ID (с проверкой доступа)
  async getOrderById(orderId: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'payment', 'user'],
    });

    if (!order) throw new Error('Заказ не найден');
    if (order.user.id !== userId) throw new Error('Нет доступа к заказу');

    return order;
  }
}

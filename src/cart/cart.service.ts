import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Product } from '../productpublic/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async addToCart(userId: number, productId: number, quantity: number = 1): Promise<{ message: string }> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Товар не найден');

    if (product.stock <= 0) {
      throw new BadRequestException('Товар временно отсутствует');
    }

    if (quantity > product.stock) {
      throw new BadRequestException(`Можно добавить максимум ${product.stock} шт.`);
    }

    let cartItem = await this.cartRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });

    const newQuantity = cartItem ? cartItem.quantity + quantity : quantity;

    if (newQuantity > product.stock) {
      throw new BadRequestException(`Общее количество превышает доступное (${product.stock} шт.)`);
    }

    if (cartItem) {
      cartItem.quantity = newQuantity;
      await this.cartRepository.save(cartItem);
    } else {
      cartItem = this.cartRepository.create({
        user,
        product,
        quantity,
      });
      await this.cartRepository.save(cartItem);
    }

    return { message: `Товар добавлен в корзину: ${newQuantity} шт.` };
  }

  async updateCartItem(id: number, quantity: number, userId: number): Promise<{ message: string }> {
    const cartItem = await this.cartRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Товар не найден в корзине');
    }

    // if (cartItem.user.id !== userId) {
    //   throw new BadRequestException('Нельзя изменить чужую корзину');
    // }

    if (quantity < 1) {
      throw new BadRequestException('Количество должно быть не меньше 1');
    }

    if (quantity > cartItem.product.stock) {
      throw new BadRequestException(`Можно купить максимум ${cartItem.product.stock} шт.`);
    }

    cartItem.quantity = quantity;
    await this.cartRepository.save(cartItem);

    return { message: `Количество обновлено: ${quantity} шт.` };
  }

  async removeCartItem(id: number, userId: number): Promise<{ message: string }> {
    const cartItem = await this.cartRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!cartItem) {
      throw new NotFoundException('Товар не найден в корзине');
    }

    await this.cartRepository.remove(cartItem);
    return { message: 'Товар удалён из корзины' };
  }

  async incrementCartItem(id: number, userId: number): Promise<{ message: string }> {
    const cartItem = await this.cartRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Товар не найден в корзине');
    }

    if (cartItem.quantity + 1 > cartItem.product.stock) {
      throw new BadRequestException(`Можно купить максимум ${cartItem.product.stock} шт.`);
    }

    cartItem.quantity += 1;
    await this.cartRepository.save(cartItem);

    return { message: `Количество увеличено: ${cartItem.quantity} шт.` };
  }

  async decrementCartItem(id: number, userId: number): Promise<{ message: string }> {
    const cartItem = await this.cartRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Товар не найден в корзине');
    }

    if (cartItem.quantity <= 1) {
      await this.cartRepository.remove(cartItem);
      return { message: 'Товар удалён из корзины' };
    }

    cartItem.quantity -= 1;
    await this.cartRepository.save(cartItem);

    return { message: `Количество уменьшено: ${cartItem.quantity} шт.` };
  }

  async clearCart(userId: number): Promise<{ message: string }> {
    const cartItems = await this.cartRepository.find({
      where: { user: { id: userId } },
    });

    if (cartItems.length === 0) {
      return { message: 'Корзина уже пуста' };
    }

    await this.cartRepository.remove(cartItems);
    return { message: 'Корзина очищена' };
  }

  async getCartByUser(userId: number): Promise<Cart[]> {
    return await this.cartRepository.find({
      where: { user: { id: userId } },
      relations: ['product']
    });
  }
}

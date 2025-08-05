import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../productpublic/entities/product.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createReviewDto: any): Promise<Review> {
    const { productId, authorId, rating, description, imageUrl } = createReviewDto;

    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) throw new Error('Товар не найден');

    const author = await this.userRepository.findOneBy({ id: authorId });
    if (!author) throw new Error('Пользователь не найден');

    const review = this.reviewRepository.create({
      rating,
      description,
      imageUrl,
      author,
      product,
    });

    return await this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewRepository.find({
      relations: ['author', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Review | null> {
    return await this.reviewRepository.findOne({
      where: { id },
      relations: ['author', 'product', 'reactions', 'comments'],
    });
  }

  async update(id: number, updateData: any, userId: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!review) throw new Error('Отзыв не найден');
    if (review.author.id !== userId) throw new Error('Нет прав на редактирование');

    Object.assign(review, updateData);
    return await this.reviewRepository.save(review);
  }

  async remove(id: number, userId: number): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!review) throw new Error('Отзыв не найден');
    if (review.author.id !== userId) throw new Error('Нет прав на удаление');

    await this.reviewRepository.remove(review);
  }
}


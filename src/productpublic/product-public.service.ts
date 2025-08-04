import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category-product.enum';

@Injectable()
export class ProductPublicService {
  constructor(
    @InjectRepository(Product)
    private readonly productPublicRepository: Repository<Product>,
  ) {}

  async findAll(filters?: {
    category?: Category;
    sort?: 'price:asc' | 'price:desc';
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    const queryBuilder = this.productPublicRepository.createQueryBuilder('product');
    queryBuilder.where('product.stock > 0');

    if (filters?.category) {
      queryBuilder.andWhere('product.category = :category', { category: filters.category });
    }

    if (filters?.sort === 'price:asc') {
      queryBuilder.orderBy('product.price', 'ASC');
    } else if (filters?.sort === 'price:desc') {
      queryBuilder.orderBy('product.price', 'DESC');
    } else {
      queryBuilder.orderBy('product.createdAt', 'DESC');
    }

    if (filters?.limit) {
      queryBuilder.limit(filters.limit);
    }
    if (filters?.offset) {
      queryBuilder.offset(filters.offset);
    }

    return await queryBuilder.getMany();
  }


  async findOne(id: number): Promise<Product> {
    const product = await this.productPublicRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
}

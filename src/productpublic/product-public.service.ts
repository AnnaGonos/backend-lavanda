import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductPublicService {
  constructor(
    @InjectRepository(Product)
    private readonly productPublicRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return await this.productPublicRepository.find({
      where: {
        stock: MoreThanOrEqual(1)
      }
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productPublicRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
}

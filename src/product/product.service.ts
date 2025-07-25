import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from '../productpublic/entities/product.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, data: any): Promise<Product> {
    await this.productRepository.update(id, data);
    return this.findOne(id);
  }

  // async remove(id: number): Promise<void> {
  //   const result = await this.productRepository.delete(id);
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`Product with ID ${id} not found`);
  //   }
  // }


  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }
  }

  // async remove(id: number) {
  //   const product = await this.productRepository.findOneBy({ id });
  //   if (!product) {
  //     throw new NotFoundException(`Товар с ID ${id} не найден`);
  //   }
  //
  //   await this.productRepository.delete(id);
  //   return { message: 'Товар успешно удалён' };
  // }

  async archive(id: number): Promise<Product> {
    const product = await this.findOne(id);

    product.stock = 0;
    return await this.productRepository.save(product);
  }

  async getArchived(): Promise<Product[]> {
    return await this.productRepository.find({
      where: {
        stock: 0
      },
    });
  }
}

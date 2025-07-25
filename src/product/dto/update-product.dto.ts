import { PartialType } from '@nestjs/mapped-types';
import { Category, CategoryList } from '../../productpublic/entities/category-product.enum';
import { IsString, IsNumber, IsEnum } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  name?: string;

  @IsNumber({}, { each: true })
  price?: number;

  @IsNumber({}, { each: true })
  discount?: number;

  @IsString()
  description?: string;

  @IsString()
  composition?: string;

  @IsEnum(CategoryList)
  category?: string;

  @IsNumber()
  stock?: number;

  @IsString()
  image?: string;
}

import { IsString, IsNumber, IsArray, ArrayMinSize, ArrayMaxSize, IsEnum, IsOptional } from 'class-validator';
import { Category, CategoryList } from '../../productpublic/entities/category-product.enum';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 }) // <-- добавь это
  @Type(() => Number)
  price: number;

  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 })
  @IsOptional()
  @Type(() => Number)
  discount?: number;

  @IsString()
  composition?: string;

  @IsString()
  description?: string;

  @IsEnum(CategoryList)
  category: Category;

  @IsNumber({ allowNaN: false })
  @Type(() => Number)
  stock: number;
}


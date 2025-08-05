import { IsNumber, IsString, IsOptional, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReviewDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  productId: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  rating: number;


  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}


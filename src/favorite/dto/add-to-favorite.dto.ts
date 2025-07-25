import { IsInt } from 'class-validator';

export class AddToFavoriteDto {
  @IsInt()
  userId: number;

  @IsInt()
  productId: number;
}


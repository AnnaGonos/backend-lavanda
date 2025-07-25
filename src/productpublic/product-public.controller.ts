import {
  Controller,
  Get,
  Param,Request,
  ParseIntPipe
} from '@nestjs/common';
import { ProductPublicService } from './product-public.service';

@Controller('api/products')
export class ProductPublicController {
  constructor(
    private readonly productPublicService: ProductPublicService,
  ) {}

  @Get('/')
  findAll() {
    return this.productPublicService.findAll();
  }

  @Get('/:id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productPublicService.findOne(id);
  }
}

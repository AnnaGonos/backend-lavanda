import {
  Controller,
  Get,
  Param, Request,
  ParseIntPipe, Query,
} from '@nestjs/common';
import { ProductPublicService } from './product-public.service';

@Controller('api/products')
export class ProductPublicController {
  constructor(
    private readonly productPublicService: ProductPublicService,
  ) {}


  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('sort') sort?: 'price:asc' | 'price:desc',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.productPublicService.findAll({
      category: category as any,
      sort,
      limit: limit ? +limit : undefined,
      offset: offset ? +offset : undefined,
    });
  }

  @Get('/:id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productPublicService.findOne(id);
  }
}

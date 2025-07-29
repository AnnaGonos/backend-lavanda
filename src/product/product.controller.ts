import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UseGuards,
  Request, UsePipes, ValidationPipe, Query, DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { CloudService } from '../cloud/cloud.service';
import { UserRole } from '../user/entities/user-role.enum';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/admin-products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly cloudService: CloudService,
  ) {}

  @Post('/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FLORIST)
  @UseInterceptors(FileInterceptor('image'))
  async addProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ) {
    if (!file) {
      throw new Error('Не загружено изображение');
    }

    const folder = 'products/';
    const objectKey = `${folder}${Date.now()}-${file.originalname}`;

    const imageUrl = await this.cloudService.uploadFile(
      file,
      'lavanda-image',
      objectKey,
    );

    const dtoWithImage = {
      ...createProductDto,
      image: imageUrl,
    };

    return this.productService.create(dtoWithImage);
  }

  @Get('/archived')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FLORIST)
  async getArchivedProducts() {
    return this.productService.getArchived();
  }

  @Get('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FLORIST)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filter') filter?: 'active' | 'archived' | 'all',
  ) {
    const safeLimit = limit > 100 ? 100 : limit;
    return this.productService.findAll(page, safeLimit, filter);
  }

  // @Get('/archived')
  // @Roles(UserRole.ADMIN)
  // @UsePipes(new ValidationPipe({ whitelist: true }))
  // async getArchivedProducts() {
  //   return this.productService.getArchived();
  // }

  @Put('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FLORIST)
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Put('/:id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FLORIST)
  async archiveProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.archive(id);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FLORIST)
  async deleteProduct(@Param('id', ParseIntPipe) id: number, @Request() req) {
    console.log('User from request:', req.user);
    return this.productService.remove(id);
  }
}

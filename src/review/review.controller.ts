import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CloudService } from '../cloud/cloud.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly cloudService: CloudService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createReviewDto: CreateReviewDto,
    @Request() req,
  ) {
    let imageUrl: string | undefined = undefined;

    if (file) {
      const folder = 'reviews/';
      const objectKey = `${folder}${Date.now()}-${file.originalname}`;
      imageUrl = await this.cloudService.uploadFile(file, 'lavanda-image', objectKey);
    }

    const reviewData = {
      ...createReviewDto,
      imageUrl: imageUrl || undefined,
      authorId: req.user.sub,
    };

    return this.reviewService.create(reviewData);
  }

  @Get()
  async findAll(@Query() query: { productId?: string }) {
    const { productId } = query;

    if (productId) {
      return this.reviewService.findByProduct(+productId);
    }

    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    let imageUrl: string | undefined = undefined;

    if (file) {
      const folder = 'reviews/';
      const objectKey = `${folder}${Date.now()}-${file.originalname}`;
      imageUrl = await this.cloudService.uploadFile(file, 'lavanda-image', objectKey);
    }

    const updateData = {
      ...updateReviewDto,
      ...(imageUrl && { imageUrl }),
    };

    return this.reviewService.update(+id, updateData, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    return this.reviewService.remove(+id, req.user.sub);
  }
}

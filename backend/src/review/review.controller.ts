import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';


@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() body: CreateReviewDto) {
    return this.reviewService.create(req.user.sub, body);
  }

  @Get('seller/my-reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  findSellerReviews(@Req() req: any) {
    return this.reviewService.findSellerReviews(req.user.sub);
  }

  @Get('user/my-reviews')
  @UseGuards(JwtAuthGuard)
  findUserReviews(@Req() req: any) {
    return this.reviewService.findUserReviews(req.user.sub);
  }

  @Get(':productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewService.findByProduct(productId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.reviewService.remove(id, req.user.sub);
  }
}

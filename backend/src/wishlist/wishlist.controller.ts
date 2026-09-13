import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.wishlistService.findAll(req.user.sub);
  }

  @Post(':productId')
  add(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.add(req.user.sub, productId);
  }

  @Delete(':productId')
  remove(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.remove(req.user.sub, productId);
  }
}

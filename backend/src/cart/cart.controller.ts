import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post()
  create(@Req() req: any, @Body() body: CreateCartDto) {
    return this.cartService.create(req.user.sub, body);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.cartService.findAll(req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: UpdateCartDto,
  ) {
    return this.cartService.update(id, req.user.sub, body.quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.cartService.remove(id, req.user.sub);
  }
}

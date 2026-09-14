import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { Req } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @Post()
  create(@Req() req: any, @Body() body: CreateProductDto) {
    return this.productService.create(body, req.user.sub);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.productService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      search,
      sort,
      categoryId,
      Number(minPrice),
      Number(maxPrice),
    );
  }

  @Get('my-product')
  @UseGuards(JwtAuthGuard)
  findMyProduct(@Req() req: any) {
    return this.productService.findMyProduct(req.user.sub);
  }

  @Get('store/:sellerId')
  getStore(@Param('sellerId') sellerId: string) {
    return this.productService.getStore(sellerId);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: UpdateProductDto,
  ) {
    return this.productService.update(id, req.user.sub, req.user.role, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.productService.remove(id, req.user.sub, req.user.role);
  }
}

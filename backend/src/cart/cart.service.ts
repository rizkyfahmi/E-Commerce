import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCartDto) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: dto.productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    if (product.sellerId === userId) {
      throw new BadRequestException(
        'Anda tidak dapat menambahkan produk dari toko Anda sendiri ke keranjang',
      );
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException('Stok tidak mencukupi');
    }

    const existingCart = await this.prisma.cart.findFirst({
      where: {
        userId,
        productId: dto.productId,
      },
    });

    if (existingCart) {
      const newQuantity = existingCart.quantity + dto.quantity;

      if (product.stock < newQuantity) {
        throw new BadRequestException('Stok tidak mencukupi');
      }

      return this.prisma.cart.update({
        where: {
          id: existingCart.id,
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: true,
        },
      });
    }

    return this.prisma.cart.create({
      data: {
        quantity: dto.quantity,
        userId,
        productId: dto.productId,
      },
      include: {
        product: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.cart.findMany({
      where: {
        userId,
      },
      include: {
        product: true,
      },
    });
  }

  async update(id: string, userId: string, quantity: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
      },
    });

    if (!cart) {
      throw new BadRequestException('Cart tidak ditemukan');
    }

    if (cart.userId !== userId) {
      throw new BadRequestException('Anda tidak memiliki akses ke cart ini');
    }

    if (cart.product.stock < quantity) {
      throw new BadRequestException('Stok tidak mencukupi');
    }

    return this.prisma.cart.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
      include: {
        product: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id,
      },
    });

    if (!cart) {
      throw new BadRequestException('Cart tidak ditemukan');
    }

    if (cart.userId !== userId) {
      throw new BadRequestException('Anda tidak memiliki akses ke cart ini');
    }

    return this.prisma.cart.delete({
      where: {
        id,
      },
    });
  }
}

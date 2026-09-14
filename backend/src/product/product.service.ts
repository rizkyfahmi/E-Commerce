import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto, sellerId: string) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        sellerId,
      },
    });
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    sort?: string,
    categoryId?: string,
    minPrice?: number,
    maxPrice?: number,
  ) {
    return this.prisma.product.findMany({
      where: {
        ...(search && {
          name: {
            contains: search,
          },
        }),

        ...(categoryId && {
          categoryId,
        }),

        ...((minPrice || maxPrice) && {
          price: {
            ...(minPrice && {
              gte: minPrice,
            }),

            ...(maxPrice && {
              lte: maxPrice,
            }),
          },
        }),
      },

      orderBy: {
        price: sort === 'desc' ? 'desc' : 'asc',
      },

      skip: (page - 1) * limit,

      take: limit,

      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
        seller: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return product;
  }

  async getStore(sellerId: string) {
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!seller) {
      throw new NotFoundException('Toko tidak ditemukan');
    }

    const products = await this.prisma.product.findMany({
      where: { sellerId },
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      seller,
      products,
      totalProducts: products.length,
    };
  }

  async findMyProduct(sellerId: string) {
    return this.prisma.product.findMany({
      where: {
        sellerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    userId: string,
    role: string,
    updateProductDto: UpdateProductDto,
  ) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // Seller hanya boleh edit produknya sendiri
    if (role === 'SELLER' && product.sellerId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke produk ini');
    }

    return this.prisma.product.update({
      where: {
        id,
      },
      data: updateProductDto,
    });
  }

  async remove(id: string, userId: string, role: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // Seller hanya boleh hapus produknya sendiri
    if (role === 'SELLER' && product.sellerId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke produk ini');
    }

    return this.prisma.product.delete({
      where: {
        id,
      },
    });
  }
}

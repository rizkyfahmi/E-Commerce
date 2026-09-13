import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { productId, rating, comment, image, video, orderId } = createReviewDto;

    //   Cek produk
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    //   Cek apakah user sudah pernah review produk ini
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingReview) {
      throw new ConflictException(
        'Anda sudah memberikan review untuk produk ini',
      );
    }

    // cek apakah user pernah membeli produk dan order sudah COMPLETED
    const purchased = await this.prisma.order.findFirst({
      where: {
        userId,
        status: 'COMPLETED',
        items: {
          some: {
            productId,
          },
        },
      },
    });

    if (!purchased) {
      throw new ForbiddenException(
        'Anda hanya dapat memberikan review setelah membeli produk (status pesanan Selesai/COMPLETED)',
      );
    }

    return this.prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
        image: image || null,
        video: video || null,
        orderId: orderId || purchased.id,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
    });
  }

  async findUserReviews(userId: string) {
    return this.prisma.review.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findSellerReviews(sellerId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        product: {
          sellerId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            price: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const ratingCounts = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    const withMediaCount = reviews.filter((r) => r.image || r.video).length;

    return {
      reviews,
      totalReviews,
      avgRating: Number(avgRating.toFixed(1)),
      ratingCounts,
      withMediaCount,
    };
  }

  async findByProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    const reviews = await this.prisma.review.findMany({
      where: {
        productId,
      },
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
    });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return {
      reviews,
      totalReviews,
      avgRating: Number(avgRating.toFixed(1)),
    };
  }

  async remove(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: {
        id,
      },
    });

    if (!review) {
      throw new NotFoundException('Review tidak ditemukan');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke review ini');
    }

    return this.prisma.review.delete({
      where: {
        id,
      },
    });
  }
}

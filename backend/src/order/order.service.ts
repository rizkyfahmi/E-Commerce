import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutDto, DirectCheckoutDto, RequestRefundDto } from './dto/checkout.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  private generatePaymentCode(method?: string): string {
    const randomDigits = (len: number) =>
      Math.floor(Math.random() * Math.pow(10, len))
        .toString()
        .padStart(len, '0');

    switch (method) {
      case 'BCA_VA':
        return `88008${randomDigits(8)}`;
      case 'MANDIRI_VA':
        return `89608${randomDigits(8)}`;
      case 'BRI_VA':
        return `10777${randomDigits(8)}`;
      case 'BNI_VA':
        return `988${randomDigits(10)}`;
      case 'PERMATA_VA':
        return `8528${randomDigits(8)}`;
      case 'INDOMARET':
        return `IDM${randomDigits(9)}`;
      case 'ALFAMART':
        return `ALF${randomDigits(9)}`;
      case 'QRIS':
        return `00020101021226580014ID.LINKAJA.WWW01189360091100213197675204581253033605802ID5914E-COMMERCE6007JAKARTA`;
      case 'GOPAY':
      case 'OVO':
      case 'SHOPEEPAY':
      case 'DANA':
        return `EWL${randomDigits(10)}`;
      case 'SPAYLATER':
      case 'KREDIVO':
        return `PL${randomDigits(10)}`;
      case 'CREDIT_CARD':
        return `CC-AUTH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      default:
        return `PAY${randomDigits(10)}`;
    }
  }

  private calculatePaymentExpiry(method?: string): Date {
    if (method === 'QRIS' || ['GOPAY', 'OVO', 'SHOPEEPAY', 'DANA'].includes(method || '')) {
      return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }
    return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }

  async checkout(userId: string, dto?: CheckoutDto) {
    return this.prisma.$transaction(async (tx) => {
      const carts = await tx.cart.findMany({
        where: {
          userId,
        },
        include: {
          product: true,
        },
      });

      if (carts.length === 0) {
        throw new BadRequestException('Keranjang kosong');
      }

      // Cek apakah ada produk dari toko sendiri dan cek stok
      for (const item of carts) {
        if (item.product.sellerId === userId) {
          throw new BadRequestException(
            `Anda tidak dapat membeli produk dari toko Anda sendiri ("${item.product.name}")`,
          );
        }

        if (item.quantity > item.product.stock) {
          throw new BadRequestException(
            `Stok produk "${item.product.name}" tidak mencukupi. Stok tersedia: ${item.product.stock}`,
          );
        }
      }

      const subtotal = carts.reduce((total, item) => {
        return total + item.product.price * item.quantity;
      }, 0);

      const shippingCost = dto?.shippingCost || 0;
      const serviceFee = dto?.serviceFee !== undefined ? dto.serviceFee : 1000;
      const discountAmount = dto?.discountAmount || 0;
      const finalPrice = Math.max(0, subtotal + shippingCost + serviceFee - discountAmount);

      const paymentMethod = dto?.paymentMethod || 'BCA_VA';
      const paymentCode = this.generatePaymentCode(paymentMethod);
      const paymentExpiresAt = this.calculatePaymentExpiry(paymentMethod);

      // Buat order
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice: finalPrice,
          shippingAddress: dto?.shippingAddress || 'Alamat Utama Terdaftar',
          shippingCourier: dto?.shippingCourier || 'JNE Reguler (2-3 Hari)',
          shippingCost,
          serviceFee,
          discountAmount,
          voucherCode: dto?.voucherCode || null,
          paymentMethod,
          paymentCode,
          paymentExpiresAt,
          payLaterTenor: dto?.payLaterTenor || null,
          payLaterMonthly: dto?.payLaterMonthly || null,
          status: OrderStatus.PENDING,
        },
      });

      // Buat order items
      await tx.orderItem.createMany({
        data: carts.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });

      // Kurangi stok
      for (const item of carts) {
        const updatedProduct = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedProduct.count === 0) {
          throw new BadRequestException(
            `Stok produk "${item.product.name}" sudah tidak mencukupi`,
          );
        }
      }

      // Kosongkan keranjang
      await tx.cart.deleteMany({
        where: {
          userId,
        },
      });

      return order;
    });
  }

  async directCheckout(
    userId: string,
    productId: string,
    quantity = 1,
    dto?: DirectCheckoutDto,
  ) {
    const qty = Math.max(1, Number(quantity) || 1);

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Produk tidak ditemukan');
      }

      if (product.sellerId === userId) {
        throw new BadRequestException(
          'Anda tidak dapat membeli produk dari toko Anda sendiri',
        );
      }

      if (qty > product.stock) {
        throw new BadRequestException(
          `Stok produk "${product.name}" tidak mencukupi. Stok tersedia: ${product.stock}`,
        );
      }

      const subtotal = product.price * qty;
      const shippingCost = dto?.shippingCost || 0;
      const serviceFee = dto?.serviceFee !== undefined ? dto.serviceFee : 1000;
      const discountAmount = dto?.discountAmount || 0;
      const finalPrice = Math.max(0, subtotal + shippingCost + serviceFee - discountAmount);

      const paymentMethod = dto?.paymentMethod || 'BCA_VA';
      const paymentCode = this.generatePaymentCode(paymentMethod);
      const paymentExpiresAt = this.calculatePaymentExpiry(paymentMethod);

      const order = await tx.order.create({
        data: {
          userId,
          totalPrice: finalPrice,
          shippingAddress: dto?.shippingAddress || 'Alamat Utama Terdaftar',
          shippingCourier: dto?.shippingCourier || 'JNE Reguler (2-3 Hari)',
          shippingCost,
          serviceFee,
          discountAmount,
          voucherCode: dto?.voucherCode || null,
          paymentMethod,
          paymentCode,
          paymentExpiresAt,
          payLaterTenor: dto?.payLaterTenor || null,
          payLaterMonthly: dto?.payLaterMonthly || null,
          status: OrderStatus.PENDING,
        },
      });

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: qty,
          price: product.price,
        },
      });

      const updatedProduct = await tx.product.updateMany({
        where: {
          id: productId,
          stock: {
            gte: qty,
          },
        },
        data: {
          stock: {
            decrement: qty,
          },
        },
      });

      if (updatedProduct.count === 0) {
        throw new BadRequestException(
          `Stok produk "${product.name}" sudah tidak mencukupi`,
        );
      }

      return order;
    });
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    id: true,
                    fullName: true,
                    username: true,
                  },
                },
                reviews: {
                  where: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async sellerSummary(sellerId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        status: {
          not: OrderStatus.CANCELLED,
        },
        items: {
          some: {
            product: {
              sellerId,
            },
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    let totalSales = 0;
    let totalUnitsSold = 0;
    const topProductsMap = new Map<
      string,
      { id: string; name: string; image?: string; unitsSold: number; revenue: number }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        if (item.product.sellerId === sellerId) {
          totalSales += item.price * item.quantity;
          totalUnitsSold += item.quantity;

          const current = topProductsMap.get(item.product.id) || {
            id: item.product.id,
            name: item.product.name,
            image: item.product.image || undefined,
            unitsSold: 0,
            revenue: 0,
          };
          current.unitsSold += item.quantity;
          current.revenue += item.price * item.quantity;
          topProductsMap.set(item.product.id, current);
        }
      }
    }

    const topProducts = Array.from(topProductsMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      totalSales,
      totalUnitsSold,
      topProducts,
    };
  }

  async sellerOrders(sellerId: string) {
    return this.prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              sellerId,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        items: {
          where: {
            product: {
              sellerId,
            },
          },
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    id: true,
                    fullName: true,
                    username: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: {
          orderId: id,
        },
      });

      return tx.order.delete({
        where: {
          id,
        },
      });
    });
  }

  async payPendingOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
      throw new BadRequestException(
        'Hanya pesanan berstatus Belum Bayar (PENDING) yang dapat dibayar.',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
        paidAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async requestRefund(orderId: string, userId: string, dto: RequestRefundDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.SHIPPED &&
      order.status !== OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Pengajuan pengembalian dana (refund) hanya dapat dilakukan untuk pesanan yang sudah dibayar.',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.REFUND_REQUESTED,
        refundReason: dto.reason,
        refundBank: dto.bank,
        refundAccountNumber: dto.accountNumber,
        refundAccountName: dto.accountName,
        refundStatus: 'MENUNGGU_VERIFIKASI',
        refundRequestedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async processRefund(orderId: string, action: 'APPROVE' | 'REJECT') {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.status !== OrderStatus.REFUND_REQUESTED) {
      throw new BadRequestException(
        'Hanya pesanan dengan pengajuan refund (REFUND_REQUESTED) yang dapat diproses.',
      );
    }

    if (action === 'APPROVE') {
      return this.prisma.$transaction(async (tx) => {
        // Kembalikan stok produk jika belum selesai
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        return tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.REFUNDED,
            refundStatus: 'DANA_DIKEMBALIKAN',
            refundProcessedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      });
    } else {
      return this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          refundStatus: 'DITOLAK',
          refundProcessedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  async cancelPendingOrder(orderId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Pesanan tidak ditemukan');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          'Hanya pesanan dengan status Belum Bayar (PENDING) yang dapat dibatalkan oleh pembeli.',
        );
      }

      // Kembalikan stok produk
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          updatedAt: new Date(),
        },
      });
    });
  }

  async shipOrder(orderId: string, sellerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    const isSellerOrder = order.items.some(
      (it) => it.product.sellerId === sellerId,
    );
    if (!isSellerOrder) {
      throw new ForbiddenException('Anda tidak berhak mengirim pesanan toko lain.');
    }

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException(
        'Hanya pesanan yang sudah dibayar (PAID) yang dapat diproses dan dikirim.',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.SHIPPED,
        updatedAt: new Date(),
      },
    });
  }

  async receiveOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException(
        'Hanya pesanan dalam pengiriman (SHIPPED) yang dapat dikonfirmasi telah diterima.',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
        updatedAt: new Date(),
      },
    });
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    userId?: string,
    role?: string,
  ) {
    if (role !== Role.SELLER) {
      throw new ForbiddenException(
        'Hanya akun seller yang memiliki izin untuk memproses dan mengubah status pesanan.',
      );
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (userId) {
      const isSellerOrder = order.items.some(
        (it) => it.product.sellerId === userId,
      );
      if (!isSellerOrder) {
        throw new ForbiddenException(
          'Anda tidak berhak mengubah pesanan produk dari toko lain.',
        );
      }
    }

    // Jika dibatalkan oleh seller, kembalikan stok
    if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      return this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        return tx.order.update({
          where: { id },
          data: {
            status,
            updatedAt: new Date(),
          },
        });
      });
    }

    return this.prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }
}

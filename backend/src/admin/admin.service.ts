import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '../auth/enums/role.enum';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) { }

  // =========================
  // DASHBOARD STATS
  // =========================
  async getDashboard() {
    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      orders,
      recentOrders,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
      this.prisma.user.count({ where: { role: Role.SELLER } }),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.findMany({
        where: {
          status: OrderStatus.COMPLETED,
        },
        select: {
          totalPrice: true,
        },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
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
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    // Total nilai kotor transaksi penjualan marketplace (GMV)
    const totalGrossSales = orders.reduce((sum, ord) => sum + ord.totalPrice, 0);

    // Keuntungan Admin: Komisi platform sebesar 0.1% dari transaksi
    const PLATFORM_FEE_PERCENT = 0.001; // 0.1%
    const totalRevenue = totalGrossSales * PLATFORM_FEE_PERCENT;

    return {
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalGrossSales,
      totalRevenue,
      platformFeeRate: "0.1%",
      recentOrders,
      recentUsers,
    };
  }

  // =========================
  // USERS MANAGEMENT
  // =========================
  async getUsers(search?: string, role?: Role) {
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          role ? { role } : {},
          search
            ? {
              OR: [
                { fullName: { contains: search } },
                { email: { contains: search } },
                { username: { contains: search } },
              ],
            }
            : {},
        ],
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            products: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const rolePriority: Record<Role, number> = {
      [Role.ADMIN]: 1,
      [Role.SELLER]: 2,
      [Role.CUSTOMER]: 3,
    };

    return users.sort((a, b) => {
      const priorityDiff = rolePriority[a.role] - rolePriority[b.role];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async updateUserRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (user.role === Role.ADMIN) {
      throw new ForbiddenException('Role akun ADMIN tidak dapat diubah');
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (user.role === Role.ADMIN) {
      throw new ForbiddenException('Akun ADMIN tidak dapat dihapus');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Hapus cart, wishlist, & review
      await tx.cart.deleteMany({ where: { userId: id } });
      await tx.wishlist.deleteMany({ where: { userId: id } });
      await tx.review.deleteMany({ where: { userId: id } });

      // 2. Hapus order items & orders milik user
      const userOrders = await tx.order.findMany({ where: { userId: id }, select: { id: true } });
      for (const ord of userOrders) {
        await tx.orderItem.deleteMany({ where: { orderId: ord.id } });
      }
      await tx.order.deleteMany({ where: { userId: id } });

      // 3. Jika seller, hapus keterkaitan produk seller
      const userProducts = await tx.product.findMany({ where: { sellerId: id }, select: { id: true } });
      for (const prod of userProducts) {
        await tx.orderItem.deleteMany({ where: { productId: prod.id } });
        await tx.cart.deleteMany({ where: { productId: prod.id } });
        await tx.wishlist.deleteMany({ where: { productId: prod.id } });
        await tx.review.deleteMany({ where: { productId: prod.id } });
      }
      await tx.product.deleteMany({ where: { sellerId: id } });

      // 4. Hapus user
      return tx.user.delete({
        where: { id },
      });
    });
  }

  // =========================
  // SELLERS MANAGEMENT
  // =========================
  async getSellers() {
    return this.prisma.user.findMany({
      where: {
        role: Role.SELLER,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        createdAt: true,
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrders(status?: OrderStatus) {
    const validStatuses = Object.values(OrderStatus);
    const filter =
      status && validStatuses.includes(status) ? { status } : {};

    return this.prisma.order.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
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
                    email: true,
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

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // =========================
  // REVIEWS MANAGEMENT
  // =========================
  async getReviews() {
    return this.prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            seller: {
              select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
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

  async deleteReview(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review tidak ditemukan');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }

  async getSellerById(id: string) {
    const seller = await this.prisma.user.findUnique({
      where: { id, role: Role.SELLER },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        createdAt: true,
        products: {
          include: {
            category: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!seller) {
      throw new NotFoundException('Toko seller tidak ditemukan');
    }

    // Ambil riwayat penjualan toko ini dari OrderItem yang sudah COMPLETED (selesai)
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        product: {
          sellerId: id,
        },
        order: {
          status: OrderStatus.COMPLETED,
        },
      },
      select: {
        price: true,
        quantity: true,
      },
    });

    const storeRevenue = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const storeSoldItems = orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      ...seller,
      storeRevenue,
      storeSoldItems,
    };
  }

  // =========================
  // PLATFORM SETTINGS
  // =========================
  private settings = {
    siteName: 'E-Shop Marketplace',
    commissionRate: 0.1, // 0.1%
    supportEmail: 'admin@eshop.com',
    supportPhone: '+62 812-3456-7890',
    maintenanceMode: false,
  };

  getSettings() {
    return this.settings;
  }

  updateSettings(data: Partial<typeof this.settings>) {
    this.settings = { ...this.settings, ...data };
    return this.settings;
  }

  // =========================
  // FINANCE & DOMPET ADMIN
  // =========================
  async getFinance() {
    const [completedOrders, inEscrowOrders] = await Promise.all([
      this.prisma.order.findMany({
        where: { status: OrderStatus.COMPLETED },
        include: {
          user: {
            select: { fullName: true, email: true },
          },
          items: {
            include: {
              product: {
                include: {
                  seller: {
                    select: { fullName: true, email: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.findMany({
        where: { status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED] } },
        select: { totalPrice: true },
      }),
    ]);

    const totalGMV = completedOrders.reduce((sum, ord) => sum + ord.totalPrice, 0);
    const commissionPercent = this.settings.commissionRate / 100;
    const totalAdminCommission = totalGMV * commissionPercent;
    const totalInEscrow = inEscrowOrders.reduce(
      (sum, ord) => sum + ord.totalPrice,
      0,
    );

    const commissionHistory = completedOrders.map((ord) => ({
      orderId: ord.id,
      date: ord.createdAt,
      customerName: ord.user?.fullName,
      customerEmail: ord.user?.email,
      sellerName: ord.items[0]?.product?.seller?.fullName || 'Mitra Toko',
      orderTotal: ord.totalPrice,
      commissionEarned: ord.totalPrice * commissionPercent,
    }));

    return {
      totalGMV,
      totalAdminCommission,
      totalInEscrow,
      commissionRate: this.settings.commissionRate,
      completedOrdersCount: completedOrders.length,
      commissionHistory,
    };
  }
}

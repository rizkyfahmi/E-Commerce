import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus, Role } from '@prisma/client';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}

  private generateTicketNumber(): string {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CS-${random}`;
  }

  async create(userId: string, dto: CreateTicketDto) {
    let ticketNumber = this.generateTicketNumber();
    let exists = await this.prisma.ticket.findUnique({ where: { ticketNumber } });
    while (exists) {
      ticketNumber = this.generateTicketNumber();
      exists = await this.prisma.ticket.findUnique({ where: { ticketNumber } });
    }

    return this.prisma.ticket.create({
      data: {
        ticketNumber,
        subject: dto.subject,
        category: dto.category,
        requestedCategoryName: dto.requestedCategoryName || null,
        priority: dto.priority || 'NORMAL',
        status: TicketStatus.OPEN,
        userId,
        messages: {
          create: {
            message: dto.message,
            senderId: userId,
            isAdmin: false,
          },
        },
      },
      include: {
        messages: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findMyTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                isAdmin: true,
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findAllForAdmin(role?: string, status?: TicketStatus, category?: string, search?: string) {
    return this.prisma.ticket.findMany({
      where: {
        ...(status && { status }),
        ...(category && { category }),
        ...(role && {
          user: {
            role: role as Role,
          },
        }),
        ...(search && {
          OR: [
            { ticketNumber: { contains: search } },
            { subject: { contains: search } },
            { requestedCategoryName: { contains: search } },
            { user: { fullName: { contains: search } } },
            { user: { email: { contains: search } } },
          ],
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                isAdmin: false,
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getAdminStats() {
    const total = await this.prisma.ticket.count();
    const open = await this.prisma.ticket.count({
      where: { status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] } },
    });
    const categoryRequests = await this.prisma.ticket.count({
      where: { category: 'REQUEST_CATEGORY', status: TicketStatus.OPEN },
    });
    const resolved = await this.prisma.ticket.count({
      where: { status: TicketStatus.RESOLVED },
    });

    return {
      total,
      open,
      categoryRequests,
      resolved,
    };
  }

  async findOne(id: string, userId?: string, isAdmin?: boolean) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Tiket tidak ditemukan');
    }

    if (!isAdmin && userId && ticket.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke tiket ini');
    }

    // Mark unread messages as read
    if (isAdmin) {
      await this.prisma.ticketMessage.updateMany({
        where: {
          ticketId: id,
          isAdmin: false,
          isRead: false,
        },
        data: { isRead: true },
      });
    } else if (userId) {
      await this.prisma.ticketMessage.updateMany({
        where: {
          ticketId: id,
          isAdmin: true,
          isRead: false,
        },
        data: { isRead: true },
      });
    }

    return ticket;
  }

  async sendMessage(ticketId: string, senderId: string, message: string, isAdmin: boolean) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('Tiket tidak ditemukan');
    }

    if (!isAdmin && ticket.userId !== senderId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke tiket ini');
    }

    const newMessage = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId,
        message,
        isAdmin,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    // If ticket was OPEN, transitioning to IN_PROGRESS when admin replies
    let newStatus = ticket.status;
    if (isAdmin && ticket.status === TicketStatus.OPEN) {
      newStatus = TicketStatus.IN_PROGRESS;
    }

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    return newMessage;
  }

  async updateStatus(ticketId: string, status: TicketStatus, adminNote?: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('Tiket tidak ditemukan');
    }

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        ...(adminNote && { adminNote }),
        updatedAt: new Date(),
      },
    });
  }

  async approveCategory(ticketId: string, adminId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('Tiket tidak ditemukan');
    }

    const categoryName = ticket.requestedCategoryName || ticket.subject.replace(/request kategori:?/i, '').trim();
    if (!categoryName) {
      throw new BadRequestException('Nama kategori request tidak ditemukan dalam tiket.');
    }

    // Check if category exists or create it
    const existing = await this.prisma.category.findUnique({
      where: { name: categoryName },
    });

    if (!existing) {
      await this.prisma.category.create({
        data: {
          name: categoryName,
          description: `Kategori hasil persetujuan request tiket #${ticket.ticketNumber}`,
          icon: 'Tag',
          isActive: true,
        },
      });
    } else if (!existing.isActive) {
      await this.prisma.category.update({
        where: { id: existing.id },
        data: { isActive: true },
      });
    }

    // Create automated response message
    await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: adminId,
        isAdmin: true,
        message: `✅ Permintaan Anda telah DISETUJUI oleh Admin. Kategori "${categoryName}" telah berhasil dibuat dan sekarang sudah aktif di marketplace serta dapat dipilih saat upload/edit produk.`,
      },
    });

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.RESOLVED,
        adminNote: `Kategori "${categoryName}" disetujui dan ditambahkan.`,
        updatedAt: new Date(),
      },
    });
  }

  async rejectCategory(ticketId: string, reason: string, adminId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('Tiket tidak ditemukan');
    }

    const categoryName = ticket.requestedCategoryName || ticket.subject;

    // Create automated rejection response message
    await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: adminId,
        isAdmin: true,
        message: `❌ Permintaan penambahan kategori "${categoryName}" DITOLAK oleh Admin.\n\nAlasan: ${reason}`,
      },
    });

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.REJECTED,
        adminNote: reason,
        updatedAt: new Date(),
      },
    });
  }
}

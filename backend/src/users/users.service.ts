import * as bcrypt from 'bcrypt';
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Username atau email sudah digunakan.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        fullName: createUserDto.fullName,
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
      },
    });

    return {
      message: 'Register berhasil',
      data: user,
    };
  }

  async updateRole(id: string, role: Role) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        role,
      },
    });
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, body: { fullName?: string; username?: string; email?: string }) {
    if (body.username || body.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                body.username ? { username: body.username } : {},
                body.email ? { email: body.email } : {},
              ],
            },
          ],
        },
      });

      if (existingUser) {
        throw new ConflictException('Username atau email sudah digunakan oleh akun lain.');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.fullName && { fullName: body.fullName }),
        ...(body.username && { username: body.username }),
        ...(body.email && { email: body.email }),
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }
}

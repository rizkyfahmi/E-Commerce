import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { OrderStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // =========================
  // DASHBOARD
  // =========================
  @Get('dashboard')
  async dashboard() {
    return this.adminService.getDashboard();
  }

  // =========================
  // USERS
  // =========================
  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: Role,
  ) {
    return this.adminService.getUsers(search, role);
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: Role,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // =========================
  // SELLERS
  // =========================
  @Get('sellers')
  async getSellers() {
    return this.adminService.getSellers();
  }

  @Get('sellers/:id')
  async getSellerById(@Param('id') id: string) {
    return this.adminService.getSellerById(id);
  }

  // =========================
  // ORDERS
  // =========================
  @Get('orders')
  async getOrders(@Query('status') status?: OrderStatus) {
    return this.adminService.getOrders(status);
  }

  // =========================
  // REVIEWS
  // =========================
  @Get('reviews')
  async getReviews() {
    return this.adminService.getReviews();
  }

  @Delete('reviews/:id')
  async deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(id);
  }

  // =========================
  // FINANCE & DOMPET ADMIN
  // =========================
  @Get('finance')
  async getFinance() {
    return this.adminService.getFinance();
  }

  // =========================
  // SETTINGS
  // =========================
  @Get('settings')
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  async updateSettings(@Body() body: any) {
    return this.adminService.updateSettings(body);
  }
}

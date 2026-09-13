import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { RejectTicketDto } from './dto/reject-ticket.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { TicketStatus } from '@prisma/client';

@Controller('ticket')
@UseGuards(JwtAuthGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  // ==========================================
  // USER (CUSTOMER & SELLER) ENDPOINTS
  // ==========================================
  @Post()
  create(@Req() req: any, @Body() body: CreateTicketDto) {
    return this.ticketService.create(req.user.sub, body);
  }

  @Get('my-tickets')
  findMyTickets(@Req() req: any) {
    return this.ticketService.findMyTickets(req.user.sub);
  }

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAllForAdmin(
    @Query('role') role?: string,
    @Query('status') status?: TicketStatus,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.ticketService.findAllForAdmin(role, status, category, search);
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getAdminStats() {
    return this.ticketService.getAdminStats();
  }

  @Post(':id/approve-category')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  approveCategory(@Param('id') id: string, @Req() req: any) {
    return this.ticketService.approveCategory(id, req.user.sub);
  }

  @Post(':id/reject-category')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  rejectCategory(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: RejectTicketDto,
  ) {
    return this.ticketService.rejectCategory(id, body.reason, req.user.sub);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: TicketStatus,
    @Body('adminNote') adminNote?: string,
  ) {
    return this.ticketService.updateStatus(id, status, adminNote);
  }

  // ==========================================
  // SHARED CONVERSATION ENDPOINTS
  // ==========================================
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.ticketService.findOne(id, req.user.sub, isAdmin);
  }

  @Post(':id/message')
  sendMessage(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: SendMessageDto,
  ) {
    const isAdmin = req.user.role === Role.ADMIN;
    return this.ticketService.sendMessage(id, req.user.sub, body.message, isAdmin);
  }
}

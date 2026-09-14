import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderService } from './order.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from 'src/auth/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CheckoutDto, DirectCheckoutDto, RequestRefundDto } from './dto/checkout.dto';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post('checkout')
  checkout(@Req() req: any, @Body() body: CheckoutDto) {
    return this.orderService.checkout(req.user.sub, body);
  }

  @Post('direct-checkout')
  directCheckout(@Req() req: any, @Body() body: DirectCheckoutDto) {
    return this.orderService.directCheckout(
      req.user.sub,
      body.productId,
      body.quantity || 1,
      body,
    );
  }

  @Get()
  findAll(@Req() req: any) {
    return this.orderService.findAll(req.user.sub);
  }

  @Get('seller/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  sellerSummary(@Req() req: any) {
    return this.orderService.sellerSummary(req.user.sub);
  }

  @Get('seller')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  sellerOrders(@Req() req: any) {
    return this.orderService.sellerOrders(req.user.sub);
  }

  @Post(':id/pay')
  payOrder(@Param('id') id: string, @Req() req: any) {
    return this.orderService.payPendingOrder(id, req.user.sub);
  }

  @Post(':id/cancel')
  cancelOrder(@Param('id') id: string, @Req() req: any) {
    return this.orderService.cancelPendingOrder(id, req.user.sub);
  }

  @Post(':id/ship')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  shipOrder(@Param('id') id: string, @Req() req: any) {
    return this.orderService.shipOrder(id, req.user.sub);
  }

  @Post(':id/receive')
  receiveOrder(@Param('id') id: string, @Req() req: any) {
    return this.orderService.receiveOrder(id, req.user.sub);
  }

  @Post(':id/request-refund')
  requestRefund(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: RequestRefundDto,
  ) {
    return this.orderService.requestRefund(id, req.user.sub, body);
  }

  @Post(':id/process-refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  processRefund(
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT' },
  ) {
    return this.orderService.processRefund(id, body.action);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  updateStatus(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(
      id,
      body.status,
      req.user.sub,
      req.user.role,
    );
  }
}

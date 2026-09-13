import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  shippingCourier?: string;

  @IsOptional()
  @IsNumber()
  shippingCost?: number;

  @IsOptional()
  @IsNumber()
  serviceFee?: number;

  @IsOptional()
  @IsString()
  voucherCode?: string;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsNumber()
  payLaterTenor?: number;

  @IsOptional()
  @IsNumber()
  payLaterMonthly?: number;
}

export class DirectCheckoutDto extends CheckoutDto {
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}

export class RequestRefundDto {
  @IsNotEmpty()
  @IsString()
  reason!: string;

  @IsNotEmpty()
  @IsString()
  bank!: string;

  @IsNotEmpty()
  @IsString()
  accountNumber!: string;

  @IsNotEmpty()
  @IsString()
  accountName!: string;
}

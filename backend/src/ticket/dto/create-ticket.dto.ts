import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  category!: string; // e.g. "REQUEST_CATEGORY", "ORDER", "PAYMENT", "PRODUCT", "ACCOUNT", "COMPLAINT", "GENERAL"

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsOptional()
  requestedCategoryName?: string;

  @IsString()
  @IsOptional()
  priority?: string;
}

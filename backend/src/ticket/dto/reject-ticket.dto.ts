import { IsNotEmpty, IsString } from 'class-validator';

export class RejectTicketDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

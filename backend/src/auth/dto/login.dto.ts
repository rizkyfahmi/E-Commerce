import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Nomor telepon, email, atau username wajib diisi' })
  @IsString()
  identifier: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  password: string;
}
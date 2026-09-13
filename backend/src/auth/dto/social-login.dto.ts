import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SocialLoginDto {
  @IsNotEmpty({ message: 'Provider wajib diisi (GOOGLE, FACEBOOK, GITHUB, APPLE)' })
  @IsString()
  provider: 'GOOGLE' | 'FACEBOOK' | 'GITHUB' | 'APPLE';

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

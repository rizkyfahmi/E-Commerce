import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}

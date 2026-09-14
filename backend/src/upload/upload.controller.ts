import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

const storage = memoryStorage();

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const url = `data:${file.mimetype};base64,${file.buffer.toString(
      'base64',
    )}`;

    return {
      filename: file.originalname,
      url,
    };
  }

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const url = `data:${file.mimetype};base64,${file.buffer.toString(
      'base64',
    )}`;

    return {
      filename: file.originalname,
      url,
    };
  }
}
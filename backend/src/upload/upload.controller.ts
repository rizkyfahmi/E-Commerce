import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, uniqueName + extname(file.originalname));
  },
});

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }
    return {
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      url: `http://localhost:3000/uploads/${file.filename}`,
    };
  }

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }
    return {
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      url: `http://localhost:3000/uploads/${file.filename}`,
    };
  }
}

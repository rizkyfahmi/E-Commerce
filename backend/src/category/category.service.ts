import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const DEFAULT_CATEGORIES = [
  // ELEKTRONIK & GADGET
  { name: 'Laptop', description: 'Laptop gaming, ultrabook, dan aksesoris laptop', icon: 'Laptop' },
  { name: 'Komputer & PC', description: 'Desktop PC, mini PC, dan peripheral komputer', icon: 'Monitor' },
  { name: 'Monitor', description: 'Monitor gaming, ultrawide, dan display resolusi tinggi', icon: 'Tv' },
  { name: 'Keyboard', description: 'Mechanical keyboard, wireless keyboard, dan keycaps', icon: 'Keyboard' },
  { name: 'Mouse', description: 'Gaming mouse, wireless mouse, dan mousepad', icon: 'Mouse' },
  { name: 'Audio', description: 'Headphone, TWS, earphone, dan speaker bluetooth', icon: 'Headphones' },
  { name: 'Kamera', description: 'Kamera mirrorless, DSLR, action cam, dan lensa', icon: 'Camera' },
  { name: 'Smartphone', description: 'HP Android, iOS, case, dan pelindung layar', icon: 'Smartphone' },
  { name: 'Tablet', description: 'Tablet Android, iPad, dan stylus pen', icon: 'Tablet' },
  { name: 'Smartwatch', description: 'Jam tangan pintar dan smart band fitness', icon: 'Watch' },
  { name: 'Gaming', description: 'Console gaming, gamepad, joystick, dan aksesoris', icon: 'Gamepad2' },
  { name: 'Printer & Scanner', description: 'Printer all-in-one, tinta, dan scanner', icon: 'Printer' },
  { name: 'Penyimpanan Data', description: 'SSD, harddisk eksternal, flashdisk, dan memory card', icon: 'HardDrive' },
  { name: 'Kabel & Charger', description: 'Kabel USB-C, lightning, power bank, dan adaptor fast charging', icon: 'Cable' },
  { name: 'Drone', description: 'Drone kamera, FPV drone, dan aksesoris drone', icon: 'Plane' },

  // FASHION
  { name: 'Fashion Pria', description: 'Kemeja, kaos, celana, dan jaket pria', icon: 'Shirt' },
  { name: 'Fashion Wanita', description: 'Dress, blouse, rok, dan pakaian wanita', icon: 'Sparkles' },
  { name: 'Fashion Anak', description: 'Pakaian dan busana anak-anak', icon: 'Baby' },
  { name: 'Sepatu & Sandal', description: 'Sneakers, formal shoes, sandal kasual, dan boots', icon: 'Footprints' },
  { name: 'Tas & Dompet', description: 'Backpack, tote bag, sling bag, dan dompet kulit', icon: 'Briefcase' },
  { name: 'Jam Tangan', description: 'Jam tangan analog, digital, dan luxury watch', icon: 'Clock' },
  { name: 'Aksesoris Fashion', description: 'Kacamata, topi, ikat pinggang, dan perhiasan', icon: 'Glasses' },

  // RUMAH TANGGA & DEKORASI
  { name: 'Peralatan Dapur', description: 'Wajan, blender, pisau, dan perlengkapan masak', icon: 'Utensils' },
  { name: 'Furniture', description: 'Meja kerja, kursi ergonomis, dan lemari', icon: 'Armchair' },
  { name: 'Dekorasi Rumah', description: 'Hiasan dinding, jam dinding, dan vas bunga', icon: 'Home' },
  { name: 'Lampu & Penerangan', description: 'Smart lamp, lampu meja, dan LED strip', icon: 'Lightbulb' },
  { name: 'Peralatan Kebersihan', description: 'Vacuum cleaner, robot vacuum, dan alat pel', icon: 'Sparkles' },

  // KECANTIKAN & PERAWATAN
  { name: 'Skincare', description: 'Serum, sunscreen, moisturizer, dan pembersih wajah', icon: 'Heart' },
  { name: 'Makeup', description: 'Lipstick, foundation, cushion, dan eye makeup', icon: 'Smile' },
  { name: 'Parfum & Wewangian', description: 'Eau de parfum, cologne, dan body mist', icon: 'Flame' },

  // MAKANAN & MINUMAN
  { name: 'Makanan & Snack', description: 'Snack ringan, kue, biskuit, dan makanan kering', icon: 'Cookie' },
  { name: 'Minuman', description: 'Kopi, teh artisan, jus, dan sirup', icon: 'Coffee' },

  // BUKU & HOBI
  { name: 'Buku & Alat Tulis', description: 'Buku novel, ensiklopedia, notebook, dan pulpen', icon: 'BookOpen' },
  { name: 'Alat Musik', description: 'Gitar, keyboard elektrik, drum, dan aksesoris musik', icon: 'Music' },
  { name: 'Mainan & Hobi', description: 'Action figure, puzzle, board game, dan diecast', icon: 'Smile' },

  // OLAHRAGA
  { name: 'Olahraga & Fitness', description: 'Matras yoga, dumbbell, resistance band, dan jersey', icon: 'Activity' },
  { name: 'Outdoor & Camping', description: 'Tenda, tas carrier, sleeping bag, dan jaket windproof', icon: 'Compass' },
];

@Injectable()
export class CategoryService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultCategories();
  }

  async seedDefaultCategories() {
    try {
      const count = await this.prisma.category.count();
      if (count < 10) {
        for (const cat of DEFAULT_CATEGORIES) {
          const existing = await this.prisma.category.findUnique({
            where: { name: cat.name },
          });
          if (!existing) {
            await this.prisma.category.create({
              data: {
                name: cat.name,
                description: cat.description,
                icon: cat.icon,
                isActive: true,
              },
            });
          }
        }
      }
    } catch (err) {
      console.error('Seed categories error:', err);
    }
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.prisma.category.findUnique({
      where: {
        name: createCategoryDto.name,
      },
    });

    if (existingCategory) {
      throw new ConflictException('Kategori dengan nama tersebut sudah ada');
    }

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        description: createCategoryDto.description || null,
        icon: createCategoryDto.icon || 'Tag',
        isActive: createCategoryDto.isActive !== undefined ? createCategoryDto.isActive : true,
      },
    });
  }

  async findAll(includeInactive = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async toggleActive(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        isActive: !category.isActive,
      },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          NOT: {
            id,
          },
        },
      });

      if (existingCategory) {
        throw new ConflictException('Kategori dengan nama tersebut sudah ada');
      }
    }

    return this.prisma.category.update({
      where: {
        id,
      },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    // Jika terdapat produk yang menggunakan kategori ini, ubah isActive menjadi false agar tidak merusak data produk
    if (category._count.products > 0) {
      return this.prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.category.delete({
      where: {
        id,
      },
    });
  }
}

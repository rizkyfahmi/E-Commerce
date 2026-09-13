import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const ALL_CATEGORIES_WITH_PRODUCTS = [
  {
    category: {
      name: 'Laptop',
      description: 'Laptop gaming, ultrabook, dan aksesoris laptop',
      icon: 'Laptop',
    },
    products: [
      {
        name: 'Apple MacBook Pro 16 M3 Max (36GB/1TB SSD)',
        description: 'Laptop flagship dengan chip Apple M3 Max, Liquid Retina XDR display 16 inci, dan baterai tahan hingga 22 jam.',
        price: 38999000,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'ASUS ROG Zephyrus G16 OLED Gaming Laptop',
        description: 'Laptop gaming ultra-tipis dengan prosesor Intel Core Ultra 9, grafis NVIDIA RTX 4080, dan layar OLED 240Hz ROG Nebula.',
        price: 29499000,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Lenovo ThinkPad X1 Carbon Gen 11 Ultrabook',
        description: 'Ultrabook bisnis legendaris berbahan serat karbon, bobot super ringan 1.12kg dengan performa tinggi Intel Evo.',
        price: 22850000,
        stock: 18,
        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Komputer & PC',
      description: 'Desktop PC, mini PC, dan peripheral komputer',
      icon: 'Monitor',
    },
    products: [
      {
        name: 'Apple Mac Studio M2 Max (32GB Unified Memory, 512GB SSD)',
        description: 'Workstation compact bertenaga luar biasa untuk desainer, video editor, dan developer profesional.',
        price: 34999000,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'ASUS ROG Strix Gaming Desktop PC RTX 4090 Core i9',
        description: 'PC Desktop Gaming monster dengan pendingin liquid AIO 360mm, 64GB DDR5, dan casing ROG Hyperion.',
        price: 49999000,
        stock: 5,
        image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Intel NUC 13 Pro Mini PC Core i7 32GB RAM',
        description: 'Mini PC ultra-kompak hemat daya dengan performa 13th Gen Intel Core i7 untuk produktivitas harian dan kantor.',
        price: 11450000,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Monitor & TV',
      description: 'Monitor gaming, ultrawide, dan smart TV resolusi tinggi',
      icon: 'Tv',
    },
    products: [
      {
        name: 'Samsung Odyssey OLED G9 49 Inch Dual QHD 240Hz Curved',
        description: 'Monitor ultrawide 49 inci kelengkungan 1800R dengan response time 0.03ms dan teknologi Neo Quantum Processor.',
        price: 24999000,
        stock: 7,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'LG C3 55 Inch OLED evo 4K Smart TV 120Hz Dolby Vision',
        description: 'Smart TV OLED premium dengan panel self-lit pixels, prosesor α9 AI 4K Gen6, dan dukungan gaming HDMI 2.1.',
        price: 18499000,
        stock: 10,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Dell UltraSharp 27 Inch 4K USB-C Hub Monitor (U2723QE)',
        description: 'Monitor profesional dengan teknologi IPS Black, akurasi warna 100% sRGB & 98% DCI-P3 serta USB-C 90W Power Delivery.',
        price: 8950000,
        stock: 14,
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Keyboard',
      description: 'Mechanical keyboard, wireless keyboard, dan keycaps',
      icon: 'Keyboard',
    },
    products: [
      {
        name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
        description: 'Keyboard mekanik aluminium full CNC dengan konektivitas Bluetooth 5.1 & Type-C, switch hot-swappable Gateron Jupiter.',
        price: 2950000,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Logitech MX Mechanical Wireless Illuminated Keyboard',
        description: 'Keyboard mekanikal low-profile tactile quiet dengan sensor pintar smart illumination dan baterai tahan 10 bulan.',
        price: 2399000,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'NuPhy Air75 V2 Ultra-Slim Wireless Keyboard',
        description: 'Mechanical keyboard ultra-slim 75% kompatibel Mac & Windows dengan PBT keycaps dan RGB underglow stylish.',
        price: 1850000,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Mouse',
      description: 'Gaming mouse, wireless mouse, dan ergonomic mouse',
      icon: 'Mouse',
    },
    products: [
      {
        name: 'Logitech MX Master 3S Performance Wireless Mouse',
        description: 'Mouse ergonomis terbaik dengan sensor 8000 DPI Darkfield pada kaca, scroll MagSpeed elektromagnetik, dan klik super hening.',
        price: 1549000,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse',
        description: 'Mouse gaming ultra-ringan 63g dengan sensor optik Focus Pro 30K DPI dan koneksi HyperSpeed Wireless bebas lag.',
        price: 1999000,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Apple Magic Mouse Multi-Touch Surface Black Edition',
        description: 'Mouse elegan nirkabel isi ulang dengan permukaan multi-touch gestur intuitif warna hitam khas Apple.',
        price: 1499000,
        stock: 22,
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Audio',
      description: 'Headphone, TWS, earphone, dan speaker bluetooth',
      icon: 'Headphones',
    },
    products: [
      {
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        description: 'Headphone peredam kebisingan industri terdepan dengan 8 mikrofon, LDAC Hi-Res Audio, dan baterai hingga 30 jam.',
        price: 4999000,
        stock: 28,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Apple AirPods Pro Gen 2 USB-C MagSafe Case',
        description: 'TWS premium dengan chip H2, Active Noise Cancellation 2x lebih kuat, Adaptive Audio, dan Personalized Spatial Audio.',
        price: 3699000,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Bose QuietComfort Ultra Spatial Audio Headphones',
        description: 'Headphone premium dengan teknologi revolusioner Bose Immersive Audio dan CustomTune untuk kenyamanan maksimal.',
        price: 5850000,
        stock: 16,
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Kamera',
      description: 'Kamera mirrorless, DSLR, action cam, dan lensa',
      icon: 'Camera',
    },
    products: [
      {
        name: 'Sony Alpha 7 IV Full-Frame Mirrorless Camera Body',
        description: 'Kamera hybrid 33MP dengan perekaman video 4K 60p, real-time autofocus AI manusia/hewan, dan 10-bit 4:2:2 Color.',
        price: 34999000,
        stock: 9,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Fujifilm X-T5 Mirrorless Digital Camera Silver Body',
        description: 'Kamera digital APS-C 40.2MP bergaya retro klasik dengan Film Simulation legendaris dan 5-axis IBIS image stabilization.',
        price: 26499000,
        stock: 11,
        image: 'https://images.unsplash.com/photo-1502982720700-befe97b2ff83?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'DJI Pocket 3 Creator Combo 4K 120fps Gimbal Camera',
        description: 'Kamera saku 1-inch CMOS dengan gimbal 3-axis terintegrasi, layar putar 2 inci OLED, dan audio wireless stereo.',
        price: 8999000,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Smartphone',
      description: 'HP Android, iOS, case, dan pelindung layar',
      icon: 'Smartphone',
    },
    products: [
      {
        name: 'iPhone 15 Pro Max 256GB Natural Titanium',
        description: 'Flagship smartphone bodi titanium tangguh berbobot ringan, chip A17 Pro, Action Button, dan kamera optik 5x zoom.',
        price: 21999000,
        stock: 24,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Samsung Galaxy S24 Ultra 5G AI 512GB Titanium Grey',
        description: 'Ponsel tercanggih dengan Galaxy AI, bodi titanium, stylus S-Pen bawaan, dan kamera 200MP Quad Telephoto.',
        price: 20499000,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Google Pixel 8 Pro 128GB Obsidian AI Camera',
        description: 'Smartphone Google murni dengan Tensor G3, layar Super Actua 120Hz, dan fitur kamera komputasional AI terdepan.',
        price: 14800000,
        stock: 14,
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Tablet',
      description: 'Tablet Android, iPad, dan stylus pen',
      icon: 'Tablet',
    },
    products: [
      {
        name: 'Apple iPad Pro 12.9 M2 Wi-Fi 256GB Space Grey',
        description: 'Tablet bertenaga chip M2 dengan layar Liquid Retina XDR mini-LED luar biasa cerah, cocok untuk kreasi konten profesional.',
        price: 19499000,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Samsung Galaxy Tab S9 Ultra 512GB with S-Pen',
        description: 'Tablet raksasa layar 14.6 inci Dynamic AMOLED 2X berstandar tahan air IP68 dan performa Snapdragon 8 Gen 2.',
        price: 18999000,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Xiaomi Pad 6 Pro 8GB/256GB Snapdragon 8+ Gen 1',
        description: 'Tablet serbaguna resolusi 2.8K 144Hz dengan performa kencang untuk gaming, multimedia, dan produktivitas fleksibel.',
        price: 5499000,
        stock: 22,
        image: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Smartwatch',
      description: 'Jam tangan pintar dan smart band fitness',
      icon: 'Watch',
    },
    products: [
      {
        name: 'Apple Watch Ultra 2 GPS + Cellular Titanium 49mm',
        description: 'Jam tangan pintar outdoor tertangguh dengan casing titanium grade aerospace, layar 3000 nits, dan GPS frekuensi ganda.',
        price: 13999000,
        stock: 10,
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Garmin Fenix 7 Pro Solar Edition Multisport GPS Watch',
        description: 'Smartwatch petualang dengan pengisian daya tenaga surya, peta bawaan topografi, sensor detak jantung Gen 5, dan senter LED.',
        price: 12999000,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Samsung Galaxy Watch 6 Classic 47mm Rotating Bezel',
        description: 'Jam tangan pintar bergaya arloji klasik dengan rotating bezel fisik, sensor BIA komposisi tubuh, dan pelacak tidur detail.',
        price: 4799000,
        stock: 18,
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Gaming',
      description: 'Console gaming, gamepad, joystick, dan aksesoris',
      icon: 'Gamepad2',
    },
    products: [
      {
        name: 'PlayStation 5 Slim 1TB Disc Edition Console',
        description: 'Konsol game generasi terbaru dengan desain lebih ramping, penyimpanan SSD ultra-cepat 1TB, dan dukungan ray tracing 4K 120Hz.',
        price: 8799000,
        stock: 18,
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Nintendo Switch OLED Model White Edition 64GB',
        description: 'Konsol gaming hybrid fleksibel dengan layar OLED 7 inci warna cerah tajam, audio internal superior, dan stand meja kokoh.',
        price: 4450000,
        stock: 28,
        image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'ASUS ROG Ally Z1 Extreme Gaming Handheld 512GB',
        description: 'Handheld PC gaming bertenaga AMD Ryzen Z1 Extreme, layar FHD 120Hz FreeSync Premium, dan kompatibel semua library game PC.',
        price: 10299000,
        stock: 14,
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Printer & Scanner',
      description: 'Printer all-in-one, tinta, dan scanner dokumen',
      icon: 'Printer',
    },
    products: [
      {
        name: 'Epson EcoTank L3250 Wi-Fi All-in-One Ink Tank Printer',
        description: 'Printer tangki tinta nirkabel ekonomis hemat biaya untuk cetak, scan, dan copy langsung lewat aplikasi smartphone.',
        price: 2450000,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Canon PIXMA G3020 Wireless High Volume Ink Tank',
        description: 'Printer serbaguna dengan kapasitas tinta ekstra besar hingga 7.700 halaman warna dan panel LCD 2-baris yang informatif.',
        price: 2299000,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'HP LaserJet Pro M404dn Monochrome Laser Printer',
        description: 'Printer laser monokrom andalan kantor berkecepatan tinggi 38 ppm dengan fitur duplex otomatis hemat kertas.',
        price: 4650000,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Penyimpanan Data',
      description: 'SSD NVMe, harddisk eksternal, flashdisk, dan memory card',
      icon: 'HardDrive',
    },
    products: [
      {
        name: 'Samsung 990 PRO 2TB NVMe PCIe 4.0 M.2 SSD with Heatsink',
        description: 'SSD internal flagship kecepatan baca hingga 7.450 MB/s dilengkapi heatsink pendingin optimal untuk PC & PS5.',
        price: 2899000,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'WD_BLACK SN850X 1TB High-Performance Gaming NVMe SSD',
        description: 'SSD gaming PCIe Gen4 berkecepatan ultra 7.300 MB/s untuk waktu loading game sekejap tanpa stutter.',
        price: 1850000,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'SanDisk Extreme Portable SSD 1TB USB 3.2 Gen 2',
        description: 'SSD eksternal portabel tangguh tahan debu dan air IP55 dengan kecepatan transfer data kilat hingga 1050 MB/s.',
        price: 1650000,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Kabel & Charger',
      description: 'Kabel USB-C, lightning, power bank, dan adaptor fast charging',
      icon: 'Cable',
    },
    products: [
      {
        name: 'Anker Prime 100W GaN Wall Charger 3-Port Fast Charging',
        description: 'Kepala charger teknologi GaN compact dengan 2 port USB-C dan 1 USB-A, sanggup mengisi daya laptop dan HP sekaligus.',
        price: 899000,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Baseus Blade 100W Power Bank 20000mAh Ultra-Thin',
        description: 'Power bank tipis 18mm kapasitas besar 20.000mAh dengan display digital status baterai dan output maksimal 100W PD.',
        price: 990000,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1609592424368-24ebf4ff50d8?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'UGREEN 100W USB-C to USB-C Braided Cable 2 Meter',
        description: 'Kabel data dan charging fast charging 100W dengan pelindung nylon braided kuat dan chip E-Marker pintar.',
        price: 129000,
        stock: 80,
        image: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Drone',
      description: 'Drone kamera, FPV drone, dan aksesoris drone',
      icon: 'Plane',
    },
    products: [
      {
        name: 'DJI Mini 4 Pro Drone Fly More Combo Plus (RC 2)',
        description: 'Drone mini di bawah 249g dengan perekaman 4K/60fps HDR True Vertical Shooting dan sensor rintangan omnidirectional.',
        price: 16890000,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'DJI Avata 2 FPV Drone Fly More Combo 3 Batteries',
        description: 'Drone FPV imersif dengan kacamata Goggles 3, kontroler gerak intuitif RC Motion 3, dan video stabil 4K Ultra-Wide.',
        price: 18450000,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Autel Robotics EVO Lite+ Premium 6K Drone Bundle',
        description: 'Drone kamera 6K dengan sensor 1 inci dan bukaan lensa f/2.8-f/11 untuk hasil foto malam minim noise yang luar biasa.',
        price: 19999000,
        stock: 6,
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Fashion Pria',
      description: 'Kemeja, kaos, celana, dan jaket pria',
      icon: 'Shirt',
    },
    products: [
      {
        name: 'Kemeja Oxford Slim Fit Premium Cotton Pria',
        description: 'Kemeja lengan panjang bahan 100% katun oxford lembut bertekstur rapi untuk tampilan formal maupun kasual elegan.',
        price: 289000,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Jaket Harrington Windbreaker Casual Waterproof',
        description: 'Jaket pria klasik model harrington dengan lapisan tahan angin dan rintik air serta furing tartan berkelas.',
        price: 425000,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Celana Chino Slim Fit Stretch Navy Dark',
        description: 'Celana chino katun stretch fleksibel yang nyaman bergerak sepanjang hari dengan potongan slim modern.',
        price: 249000,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Fashion Wanita',
      description: 'Dress, blouse, rok, dan pakaian wanita',
      icon: 'Sparkles',
    },
    products: [
      {
        name: 'Elegant Floral Midi Dress Linen Premium',
        description: 'Midi dress motif floral menawan bahan katun linen sejuk dengan aksen tali pinggang yang mempermanis siluet.',
        price: 349000,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Korean Oversized Blazer Casual Wanita Ivory White',
        description: 'Blazer gaya Korea semi-formal potongan oversized dengan material premium anti-kusut dan warna ivory netral elegan.',
        price: 399000,
        stock: 28,
        image: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Blouse Silk Satin Long Sleeve Modern Top',
        description: 'Atasan blus bahan silk satin halus berkilau lembut dengan kancing mutiara untuk acara santai maupun formal.',
        price: 269000,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Fashion Anak',
      description: 'Pakaian dan busana anak-anak',
      icon: 'Baby',
    },
    products: [
      {
        name: 'Setelan Kaos & Celana Katun Organik Anak Unisex',
        description: 'Setelan pakaian anak bahan katun organik lembut yang sangat adem, ramah kulit sensitif, dan mudah menyerap keringat.',
        price: 145000,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eda?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Dress Pesta Anak Brokat Princess Edition',
        description: 'Gaun pesta anak perempuan dengan aksen brokat halus dan lapisan tulle empuk yang nyaman tanpa rasa gatal.',
        price: 215000,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Jaket Hoodie Anak Fleece Lembut Warm Series',
        description: 'Jaket hoodie anak bahan fleece hangat dengan resleting halus dan kantong kanguru depan untuk perlindungan udara dingin.',
        price: 175000,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Sepatu & Sandal',
      description: 'Sneakers, formal shoes, sandal kasual, dan boots',
      icon: 'Footprints',
    },
    products: [
      {
        name: 'Nike Air Jordan 1 Retro High OG Chicago Edition',
        description: 'Sneaker ikonik legendaris kombinasi kulit asli warna merah putih hitam dengan bantalan Air-Sole klasik yang empuk.',
        price: 2899000,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'New Balance 990v6 Made in USA Grey Running Shoes',
        description: 'Sepatu lari dan lifestyle premium dengan teknologi FuelCell foam dan material suede babi asli berstandar tinggi.',
        price: 3699000,
        stock: 18,
        image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Birkenstock Arizona Birko-Flor Sandal Mocca Classic',
        description: 'Sandal strap ganda ergonomis dengan alas gabus anatomi yang menyesuaikan bentuk telapak kaki untuk kenyamanan harian.',
        price: 1450000,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Tas & Dompet',
      description: 'Backpack, tote bag, sling bag, dan dompet kulit',
      icon: 'Briefcase',
    },
    products: [
      {
        name: 'Bellroy Classic Backpack Plus 20L Water-Resistant',
        description: 'Ransel laptop fungsional berbahan daur ulang tahan cuaca dengan kompartemen laptop 16 inci dan kantong rahasia aman.',
        price: 2450000,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Dompet Kulit Pria Asli Bifold Genuine Leather RFID Block',
        description: 'Dompet kulit sapi asli full grain dengan proteksi anti-skimming RFID, 8 slot kartu, dan kompartemen uang tunai ganda.',
        price: 385000,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Kate Spade Canvas Leather Trim Tote Bag Wanita',
        description: 'Tas tote kapasitas luas berbahan kanvas tebal dengan aksen kulit asli yang chic untuk gaya kerja dan liburan.',
        price: 2950000,
        stock: 14,
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Jam Tangan',
      description: 'Jam tangan analog, digital, dan luxury watch',
      icon: 'Clock',
    },
    products: [
      {
        name: 'Seiko Prospex Diver Automatic 200M Men Watch (SPB143)',
        description: 'Jam tangan selam mekanis otomatis legendaris water resistant 200 meter dengan kaca safir dan cadangan daya 70 jam.',
        price: 15400000,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Tissot PRX Powermatic 80 Automatic 40mm Blue Dial',
        description: 'Arloji Swiss bergaya retro 1978 dengan gelang terintegrasi, dial bermotif waffle biru, dan movement Powermatic 80.',
        price: 10800000,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Casio G-Shock GA-2100 CasiOak All Black Tough Resin',
        description: 'Jam tangan digital-analog shock resist tertipis berstruktur Carbon Core Guard yang tangguh dan tahan air 200M.',
        price: 1650000,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Aksesoris Fashion',
      description: 'Kacamata, topi, ikat pinggang, dan perhiasan',
      icon: 'Glasses',
    },
    products: [
      {
        name: 'Ray-Ban Wayfarer Classic Polarized Sunglasses',
        description: 'Kacamata hitam legendaris dengan lensa terpolarisasi anti-UV 100% dan bingkai asetat hitam berkilau abadi.',
        price: 2450000,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Sabuk Kulit Pria Asli Formal Reversible Buckle Belt',
        description: 'Ikat pinggang kulit asli bolak-balik warna hitam/cokelat dengan kepala gesper stainless steel modern anti-karat.',
        price: 320000,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Topi Baseball Cap Classic Cotton Adjustable Strap',
        description: 'Topi baseball kasual bahan katun twill tebal dengan strap pengatur ukuran logam kuningan yang vintage.',
        price: 135000,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Peralatan Dapur',
      description: 'Wajan, blender, pisau, dan perlengkapan masak',
      icon: 'Utensils',
    },
    products: [
      {
        name: 'Philips Airfryer XXL 7.2L Smart Sensing Technology',
        description: 'Airfryer kapasitas jumbo dengan teknologi penghilang lemak otomatis, memasak ayam utuh renyah tanpa minyak.',
        price: 3699000,
        stock: 16,
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Nutribullet Pro 900W High-Speed Personal Blender',
        description: 'Blender ekstraksi nutrisi bertenaga 900 Watt yang mampu melumatkan es batu dan biji buah dalam hitungan detik.',
        price: 1899000,
        stock: 22,
        image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Set Pisau Dapur Stainless Steel Damascus Pattern 6-in-1',
        description: 'Set pisau koki profesional berbahan baja tahan karat super tajam dengan blok kayu akasia estetik.',
        price: 580000,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Furniture',
      description: 'Meja kerja, kursi ergonomis, dan lemari',
      icon: 'Armchair',
    },
    products: [
      {
        name: 'Kursi Kerja Ergonomis Mesh Herman Miller Aeron Style',
        description: 'Kursi kantor ergonomis dengan sandaran jaring breathable, lumbar support adaptif, dan armrest 3D yang dapat disesuaikan.',
        price: 2750000,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1580481077194-4d830b58f844?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Standing Desk Adjustable Electric Dual Motor 140x70cm',
        description: 'Meja kerja elektrik naik-turun dengan motor ganda senyap, memory height preset, dan rangka baja kokoh anti goyang.',
        price: 3890000,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Lemari Pakaian Minimalis 3 Pintu Sliding Scandinavian',
        description: 'Lemari baju kayu olahan solid motif oak natural dengan cermin penuh dan gantungan baju ekstra lega.',
        price: 2450000,
        stock: 10,
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Dekorasi Rumah',
      description: 'Hiasan dinding, jam dinding, dan vas bunga',
      icon: 'Home',
    },
    products: [
      {
        name: 'Jam Dinding Minimalis Kayu Jati Solid Silent Movement 35cm',
        description: 'Jam dinding kayu jati alami tanpa detak suara bising dengan penunjuk angka modern Scandinavian aesthetic.',
        price: 285000,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Vas Bunga Keramik Nordic Minimalist Aesthetic Set 3-in-1',
        description: 'Set tiga vas keramik bertekstur matte warna pastel untuk bunga kering dan dekorasi meja tamu minimalis.',
        price: 195000,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Lukisan Kanvas Abstrak Gold Foil Framed 60x90cm',
        description: 'Hiasan dinding seni kanvas modern dengan aksen foil emas mewah lengkap dengan bingkai kayu ramping.',
        price: 450000,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Lampu & Penerangan',
      description: 'Smart lamp, lampu meja, dan LED strip',
      icon: 'Lightbulb',
    },
    products: [
      {
        name: 'Philips Hue White & Color Ambiance Starter Kit LED E27',
        description: 'Paket lampu pintar 16 juta warna dengan Bridge kendali suara via Alexa/Google Assistant dan sinkronisasi musik.',
        price: 1999000,
        stock: 22,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Lampu Meja Belajar LED Eye-Care Dimmable Touch Control',
        description: 'Lampu meja arsitek bebas kedip (flicker-free) dengan 5 mode temperatur warna dan port charging USB tambahan.',
        price: 299000,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Xiaomi Yeelight Smart LED Lightstrip Pro RGBIC 2 Meter',
        description: 'Lampu strip LED fleksibel berteknologi RGBIC gradasi warna dinamis yang dapat disambung hingga 10 meter.',
        price: 485000,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Peralatan Kebersihan',
      description: 'Vacuum cleaner, robot vacuum, dan alat pel',
      icon: 'Sparkles',
    },
    products: [
      {
        name: 'Dyson V12 Detect Slim Fluffy Cordless Vacuum Cleaner',
        description: 'Vacuum nirkabel ringan dengan laser pendeteksi debu mikroskopis dan sensor piezo pengukur partikel kotoran.',
        price: 11999000,
        stock: 10,
        image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Dreame Bot L10s Ultra Robot Vacuum & Mop Self-Emptying',
        description: 'Robot pembersih serba otomatis dengan stasiun pembuang debu, pencuci pel, dan navigasi AI 3D obstacle avoidance.',
        price: 12499000,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Deerma Spray Mop Microfiber 360 Degree Rotating Head',
        description: 'Alat pel semprot air praktis dengan tangki 350ml dan kain microfiber penyerap kotoran super cepat tanpa ember.',
        price: 139000,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Skincare',
      description: 'Serum, sunscreen, moisturizer, dan pembersih wajah',
      icon: 'Heart',
    },
    products: [
      {
        name: 'Serum Wajah Vitamin C + Niacinamide Brightening 30ml',
        description: 'Serum pencerah kulit intensif dengan kandungan Ethyl Ascorbic Acid dan Niacinamide 5% untuk memudarkan flek hitam.',
        price: 165000,
        stock: 80,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Sunscreen SPF 50+ PA++++ Watery Sun Gel 50ml',
        description: 'Tabir surya bertekstur gel ringan tanpa whitecast yang cepat meresap dengan sensasi dingin menyegarkan.',
        price: 129000,
        stock: 100,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Gentle Cleanser Hydrating Ceramide Face Wash 150ml',
        description: 'Pembersih wajah berbusa lembut non-SLS yang menjaga skin barrier dengan 5 jenis Ceramide dan Hyaluronic Acid.',
        price: 115000,
        stock: 75,
        image: 'https://images.unsplash.com/photo-1556228722-d0b5d034abf2?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Makeup',
      description: 'Lipstick, foundation, cushion, dan eye makeup',
      icon: 'Smile',
    },
    products: [
      {
        name: 'Cushion Foundation Long-Wear Flawless SPF 50+ PA+++',
        description: 'Cushion dengan coverage medium-to-full berdaya tahan 16 jam matte alami tanpa membuat kulit kering.',
        price: 185000,
        stock: 65,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Matte Velvet Lipstick Hydrating Nude Rose 3.8g',
        description: 'Lipstik matte lembut dengan formula vitamin E dan shea butter yang tidak menggumpal dan transferproof.',
        price: 95000,
        stock: 90,
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Eyeshadow Palette 12 Colors Warm Neutral Shimmer',
        description: 'Palet perona mata 12 warna transisi lembut matte dan shimmer berpigmentasi tinggi mudah dibaurkan.',
        price: 145000,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Parfum & Wewangian',
      description: 'Eau de parfum, cologne, dan body mist',
      icon: 'Flame',
    },
    products: [
      {
        name: 'Maison Margiela REPLICA Jazz Club Eau de Toilette 100ml',
        description: 'Parfum mewah beraroma tembakau, vanila hangat, dan rum yang mengingatkan pada suasana jazz bar klasik Brooklyn.',
        price: 2450000,
        stock: 18,
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Bleu de Chanel Eau de Parfum Men 100ml Vaporisateur',
        description: 'Wewangian pria abadi dengan aroma woody aromatic yang maskulin, segar, dan berkarakter kuat memikat.',
        price: 2850000,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Jo Malone English Pear & Freesia Cologne 100ml',
        description: 'Aroma kesegaran buah pir matang yang dipadukan keanggunan bunga freesia putih dan sentuhan patchouli lembut.',
        price: 2650000,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Makanan & Snack',
      description: 'Snack ringan, kue, biskuit, dan makanan kering',
      icon: 'Cookie',
    },
    products: [
      {
        name: 'Almond Butter Crispy Cookies Premium Jar 250g',
        description: 'Kue kering renyah dengan taburan almond panggang renyah dan butter New Zealand wangi menggoda selera.',
        price: 85000,
        stock: 70,
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Keripik Kentang Truffle Gourmet Crisps 150g',
        description: 'Keripik kentang pilihan berlumur minyak black truffle Italia asli dengan cita rasa gurih mewah.',
        price: 65000,
        stock: 85,
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Dark Chocolate Artisanal Single Origin 85% Bar 100g',
        description: 'Cokelat hitam premium olahan biji kakao fermentasi lokal Bali dengan rasa kaya antioksidan dan sedikit manis alami.',
        price: 55000,
        stock: 90,
        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Minuman',
      description: 'Kopi, teh artisan, jus, dan sirup',
      icon: 'Coffee',
    },
    products: [
      {
        name: 'Biji Kopi Arabika Specialty Single Origin Gayo 250g',
        description: 'Biji kopi sangrai medium roast dengan cupping notes cokelat hitam, rempah, dan keasaman buah tropis yang seimbang.',
        price: 95000,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Teh Hijau Matcha Jepang Ceremonial Grade Uji Tin 50g',
        description: 'Bubuk matcha murni kelas seremonial dari perkebunan Uji Kyoto beraroma umami kaya dan warna hijau emerald cerah.',
        price: 220000,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Artisan Chamomile Lavender Herbal Tea Box 20 Teabags',
        description: 'Teh herbal relaksasi bebas kafein perpaduan bunga chamomile Jerman dan lavender Prancis untuk tidur lebih lelap.',
        price: 78000,
        stock: 55,
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Buku & Alat Tulis',
      description: 'Buku novel, ensiklopedia, notebook, dan pulpen',
      icon: 'BookOpen',
    },
    products: [
      {
        name: 'Hardcover Dotted Bullet Journal Notebook 160 GSM A5',
        description: 'Buku catatan jurnal bersampul tebal tahan air dengan kertas 160 GSM anti-bleed untuk journaling dan sketsa.',
        price: 145000,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Set Pulpen Fountain Pen Pilot Metropolitan Fine Nib',
        description: 'Pena klasik berbadan logam kuningan seimbang dengan mata pena baja tahan karat untuk tulisan tangan berkelas.',
        price: 285000,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Atomic Habits by James Clear Buku Best Seller Internasional',
        description: 'Buku panduan praktis legendaris tentang cara membangun kebiasaan baik dan menghilangkan kebiasaan buruk.',
        price: 110000,
        stock: 65,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Alat Musik',
      description: 'Gitar, keyboard elektrik, drum, dan aksesoris musik',
      icon: 'Music',
    },
    products: [
      {
        name: 'Gitar Akustik Yamaha F310 Natural Wood Finish',
        description: 'Gitar akustik terpopuler di dunia dengan bodi spruce dreadnought menghasilkan nada resonansi hangat dan jernih.',
        price: 1450000,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Keyboard Digital Piano Yamaha P-45 88-Key Weighted Action',
        description: 'Piano digital portabel 88 tuts Graded Hammer Standard yang mereplikasi sentuhan tuts piano akustik sesungguhnya.',
        price: 5999000,
        stock: 10,
        image: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Ukulele Soprano Mahogany Wood Starter Pack 21 Inch',
        description: 'Ukulele soprano kayu mahoni hangat dengan senar Aquila nilon empuk lengkap bersama tas gigbag dan tuner digital.',
        price: 345000,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1535587565100-8c26f0464684?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Mainan & Hobi',
      description: 'Action figure, puzzle, board game, dan diecast',
      icon: 'Smile',
    },
    products: [
      {
        name: 'LEGO Icons Porsche 911 Turbo and Targa Building Kit 10295',
        description: 'Set balok LEGO kolektor 1458 keping mobil sport klasik Porsche 911 dengan kemudi fungsional dan detail mesin realistis.',
        price: 2899000,
        stock: 14,
        image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Bandai Gundam RG 1/144 RX-78-2 Ver.2.0 Model Kit',
        description: 'Model kit Gundam Real Grade skala 1/144 dengan inner frame artikulasi lentur dan detail panel line presisi tinggi.',
        price: 590000,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Board Game Catan Base Game Official Indonesian Edition',
        description: 'Permainan papan strategi perdagangan dan pembangunan pulau terpopuler di dunia untuk 3-4 pemain segala usia.',
        price: 649000,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Olahraga & Fitness',
      description: 'Matras yoga, dumbbell, resistance band, dan jersey',
      icon: 'Activity',
    },
    products: [
      {
        name: 'Matras Yoga Anti-Slip TPE Eco-Friendly 6mm Alignment Lines',
        description: 'Matras olahraga bahan TPE ramah lingkungan anti-selip dua sisi dengan garis panduan posisi tubuh yang presisi.',
        price: 185000,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Adjustable Dumbbell Set 20KG Rubber Hex Chrome Grip',
        description: 'Set dumbbell angkat beban fleksibel yang dapat dirakit menjadi barbell panjang dengan pegangan chrome anti-slip.',
        price: 499000,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Set Resistance Loop Bands 5-Level Workout Elastic',
        description: 'Set 5 karet resistensi lateks alami dengan level beban berbeda dari ringan hingga ekstra berat untuk latihan otot kaki & tubuh.',
        price: 79000,
        stock: 80,
        image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Outdoor & Camping',
      description: 'Tenda, tas carrier, sleeping bag, dan jaket windproof',
      icon: 'Compass',
    },
    products: [
      {
        name: 'Tenda Camping Dome Waterproof 4 Orang Double Layer',
        description: 'Tenda kemping keluarga anti-hujan deras PU3000mm dengan sistem frame aluminium kokoh dan ventilasi sirkulasi udara baik.',
        price: 950000,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Tas Carrier Gunung 60L Ultralight Ergo Backsystem',
        description: 'Ransel gunung kapasitas 60 liter dengan teknologi bantalan punggung berpori anti-gerah dan rain cover pelindung hujan.',
        price: 890000,
        stock: 22,
        image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Sleeping Bag Mummy Thermal Ultralight Outdoor 0-10C',
        description: 'Kantung tidur model mumi insulasi thermal hangat berbobot ringan 900g yang dapat dilipat sangat ringkas ke dalam tas.',
        price: 275000,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=800&auto=format&fit=crop',
      },
    ],
  },
];

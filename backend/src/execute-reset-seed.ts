import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ALL_CATEGORIES_WITH_PRODUCTS } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('=== STARTING DATABASE PURGE & RE-SEED ===');

  // 1. Reset all transaction and user interaction data (Orders, OrderItems, Reviews, Carts, Wishlists)
  console.log('1. Clearing Orders, OrderItems, Reviews, Carts, Wishlists...');
  const deletedOrderItems = await prisma.orderItem.deleteMany({});
  const deletedOrders = await prisma.order.deleteMany({});
  const deletedReviews = await prisma.review.deleteMany({});
  const deletedCarts = await prisma.cart.deleteMany({});
  const deletedWishlists = await prisma.wishlist.deleteMany({});

  console.log(`- Deleted OrderItems: ${deletedOrderItems.count}`);
  console.log(`- Deleted Orders: ${deletedOrders.count}`);
  console.log(`- Deleted Reviews: ${deletedReviews.count}`);
  console.log(`- Deleted Carts: ${deletedCarts.count}`);
  console.log(`- Deleted Wishlists: ${deletedWishlists.count}`);

  // 2. Delete all existing products
  console.log('2. Clearing all seller products...');
  const deletedProducts = await prisma.product.deleteMany({});
  console.log(`- Deleted Products: ${deletedProducts.count}`);

  // 3. Ensure Seller user exists
  console.log('3. Ensuring Seller account exists...');
  let seller = await prisma.user.findFirst({
    where: { role: Role.SELLER },
  });

  if (!seller) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    seller = await prisma.user.create({
      data: {
        fullName: 'Official Tech Store',
        username: 'officialtech',
        email: 'seller@eshop.com',
        phone: '08222222222',
        password: hashedPassword,
        role: Role.SELLER,
        isVerified: true,
      },
    });
    console.log(`- Created new Seller: ${seller.fullName} (${seller.id})`);
  } else {
    console.log(`- Found existing Seller: ${seller.fullName} (${seller.id})`);
  }

  // 4. Upsert/Create Categories and Add 3 Products per Category
  console.log('4. Seeding categories and 3 products per category...');
  let totalCategoriesCreated = 0;
  let totalProductsCreated = 0;

  for (const item of ALL_CATEGORIES_WITH_PRODUCTS) {
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: item.category.name },
          { name: item.category.name.replace(' & TV', '') },
          { name: item.category.name.replace('Penyimpanan Data', 'Penyimpanan') },
        ],
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: item.category.name,
          description: item.category.description,
          icon: item.category.icon,
          isActive: true,
        },
      });
      totalCategoriesCreated++;
    } else {
      category = await prisma.category.update({
        where: { id: category.id },
        data: {
          name: item.category.name,
          description: item.category.description,
          icon: item.category.icon,
          isActive: true,
        },
      });
    }

    // Insert the 3 products for this category
    for (const prod of item.products) {
      await prisma.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          image: prod.image,
          categoryId: category.id,
          sellerId: seller.id,
        },
      });
      totalProductsCreated++;
    }
  }

  // Also verify any remaining categories in the database to ensure EVERY single category has at least 3 products
  const allDbCategories = await prisma.category.findMany({
    include: {
      products: true,
    },
  });

  console.log(`- Total Categories in DB: ${allDbCategories.length}`);
  console.log(`- Total Products Created: ${totalProductsCreated}`);

  // Verification step
  console.log('5. Verifying category products count...');
  let anyError = false;
  for (const cat of allDbCategories) {
    if (cat.products.length < 3) {
      console.warn(`WARNING: Category "${cat.name}" has only ${cat.products.length} products!`);
      // Add fallback products if any category had < 3
      const needed = 3 - cat.products.length;
      for (let i = 1; i <= needed; i++) {
        await prisma.product.create({
          data: {
            name: `${cat.name} Premium Edition Series ${cat.products.length + 1}`,
            description: `Produk berkualitas tinggi untuk kategori ${cat.name} dengan garansi resmi dan kualitas terbaik.`,
            price: 500000 + i * 250000,
            stock: 20,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
            categoryId: cat.id,
            sellerId: seller.id,
          },
        });
        totalProductsCreated++;
      }
    }
  }

  const finalCheckCategories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const finalOrdersCount = await prisma.order.count();
  const finalOrderItemsCount = await prisma.orderItem.count();
  const finalReviewsCount = await prisma.review.count();
  const finalCartsCount = await prisma.cart.count();
  const finalWishlistsCount = await prisma.wishlist.count();
  const finalProductsCount = await prisma.product.count();

  console.log('=== SEED COMPLETE SUMMARY ===');
  console.log({
    finalOrdersCount,
    finalOrderItemsCount,
    finalReviewsCount,
    finalCartsCount,
    finalWishlistsCount,
    finalCategoriesCount: finalCheckCategories.length,
    finalProductsCount,
  });

  for (const cat of finalCheckCategories) {
    console.log(`[OK] Category: "${cat.name}" -> ${cat._count.products} products`);
  }
}

main()
  .catch((e) => {
    console.error('Error during reset and seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

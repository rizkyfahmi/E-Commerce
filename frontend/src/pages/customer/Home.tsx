import { useState } from "react";
import Hero from "../../components/Hero";
import CategorySection from "../../components/CategorySection";
import ProductSection from "../../components/ProductSection";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  categoryId?: string;
  sellerId?: string;
  category?: {
    id?: string;
    name: string;
  };
  seller?: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface HomeProps {
  onProductClick: (product: Product) => void;
  onWishlistChange: (hasWishlist: boolean) => void;
  onAddToCart: (productId: string, quantity: number) => void;
}

function Home({
  onProductClick,
  onWishlistChange,
  onAddToCart,
}: HomeProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main>
        <Hero />
        <CategorySection
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(catId) => setSelectedCategoryId(catId)}
        />
        <ProductSection
          selectedCategoryId={selectedCategoryId}
          onResetCategory={() => setSelectedCategoryId(null)}
          onProductClick={onProductClick}
          onWishlistChange={onWishlistChange}
          onAddToCart={onAddToCart}
        />
      </main>
    </div>
  );
}

export default Home;
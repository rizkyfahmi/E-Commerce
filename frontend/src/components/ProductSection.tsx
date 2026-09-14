import { API_BASE_URL } from "../lib/config";
import { Heart, Search, Star, Store, Filter, X, Zap, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId, getUserRole, isGuestUser } from "../lib/auth";
import ConfirmModal from "./ConfirmModal";
import GuestModal from "./GuestModal";

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
  reviews?: { rating: number }[];
}

interface ProductSectionProps {
  selectedCategoryId?: string | null;
  onResetCategory?: () => void;
  onProductClick: (product: Product) => void;
  onWishlistChange: (hasWishlist: boolean) => void;
  onAddToCart: (productId: string, quantity: number) => void;
}

function ProductSection({
  selectedCategoryId,
  onResetCategory,
  onProductClick,
  onWishlistChange,
  onAddToCart,
}: ProductSectionProps) {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Confirmation & Guest modal states
  const [confirmBuyProduct, setConfirmBuyProduct] = useState<Product | null>(null);
  const [guestModalOpen, setGuestModalOpen] = useState(false);

  const currentUserId = getCurrentUserId();
  const userRole = getUserRole();
  const isSeller = userRole === "SELLER";

  const handleDirectBuyClick = (product: Product, isOwn: boolean) => {
    if (isGuestUser()) {
      setGuestModalOpen(true);
      return;
    }
    if (isOwn) {
      alert("Anda tidak dapat membeli produk dari toko Anda sendiri.");
      return;
    }
    setConfirmBuyProduct(product);
  };

  const handleConfirmDirectBuy = () => {
    if (!confirmBuyProduct) return;
    const product = confirmBuyProduct;
    setConfirmBuyProduct(null);
    navigate("/checkout", {
      state: {
        directItem: {
          product,
          quantity: 1,
        },
      },
    });
  };

  // Ambil produk dari backend
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/product?limit=100`);

        if (!response.ok) {
          throw new Error("Gagal mengambil data produk");
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
        setError("Tidak dapat mengambil data produk.");
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  useEffect(() => {
    const getWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const productIds = data.map((item: { productId: string }) => item.productId);

        setLikedProducts(productIds);
        onWishlistChange(productIds.length > 0);
      } catch (error) {
        console.error("Wishlist fetch error:", error);
      }
    };

    getWishlist();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateRating = (product: Product) => {
    if (!product.reviews || product.reviews.length === 0) return 5.0;
    const total = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    return Number((total / product.reviews.length).toFixed(1));
  };

  // Wishlist
  const toggleLike = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const liked = likedProducts.includes(id);

    if (liked) {
      const confirmDelete = window.confirm(
        "Apakah Anda yakin ingin menghapus produk ini dari wishlist?",
      );
      if (!confirmDelete) return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/${id}`, {
        method: liked ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengubah wishlist");
      }

      setLikedProducts((current) =>
        liked ? current.filter((item) => item !== id) : [...current, id],
      );

      onWishlistChange(!liked);
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  // Filtered products based on category AND search
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategoryId) {
      result = result.filter(
        (p) => p.categoryId === selectedCategoryId || p.category?.id === selectedCategoryId,
      );
    }

    const keyword = search.toLowerCase().trim();
    if (keyword) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(keyword) ||
          product.seller?.fullName?.toLowerCase().includes(keyword) ||
          product.category?.name?.toLowerCase().includes(keyword),
      );
    }

    return result;
  }, [products, search, selectedCategoryId]);

  const activeCategoryName = useMemo(() => {
    if (!selectedCategoryId) return null;
    const matched = products.find(
      (p) => p.categoryId === selectedCategoryId || p.category?.id === selectedCategoryId,
    );
    return matched?.category?.name || "Kategori Terpilih";
  }, [products, selectedCategoryId]);

  // Separate for Seller home
  const mySellerProducts = useMemo(() => {
    if (!currentUserId || !isSeller) return [];
    return filteredProducts.filter(
      (p) => p.sellerId === currentUserId || p.seller?.id === currentUserId,
    );
  }, [filteredProducts, currentUserId, isSeller]);

  const recommendedProducts = useMemo(() => {
    if (!currentUserId || !isSeller) return filteredProducts;
    return filteredProducts.filter(
      (p) => p.sellerId !== currentUserId && p.seller?.id !== currentUserId,
    );
  }, [filteredProducts, currentUserId, isSeller]);

  // Render Responsive Product Card
  const renderProductCard = (product: Product, isOwn: boolean) => {
    const liked = likedProducts.includes(product.id);
    const avgRating = calculateRating(product);
    const sellerId = product.sellerId || product.seller?.id;
    const sellerName = product.seller?.fullName || "Official Store";

    return (
      <div
        key={product.id}
        onClick={() => onProductClick(product)}
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
      >
        <div>
          {/* IMAGE */}
          <div className="relative h-40 sm:h-52 overflow-hidden bg-slate-100">
            {product.image ? (
              <img
                src={
                  product.image?.startsWith("http")
                    ? product.image
                    : `${API_BASE_URL}/uploads/${product.image}`
                }
                alt={product.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Tidak ada gambar
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex flex-col gap-1">
              {isOwn ? (
                <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-sm">
                  Produk Anda
                </span>
              ) : (
                <span className="rounded-md bg-white/90 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-slate-800 backdrop-blur shadow-sm">
                  {product.stock > 0 ? "Tersedia" : "Habis"}
                </span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(product.id);
              }}
              className={`absolute right-2 top-2 sm:right-3 sm:top-3 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/90 backdrop-blur shadow-sm transition ${
                liked ? "text-red-500" : "text-slate-800 hover:bg-white"
              }`}
            >
              <Heart size={15} fill={liked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-slate-400">
              <span className="uppercase tracking-wider truncate max-w-[50%]">
                {product.category?.name || "General"}
              </span>
              <span className="truncate max-w-[50%] text-slate-500">{sellerName}</span>
            </div>

            <h3 className="mt-1 line-clamp-2 font-bold text-slate-950 text-xs sm:text-sm group-hover:text-blue-600 transition leading-snug">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="mt-1.5 flex items-center gap-1">
              <Star size={12} fill="currentColor" className="text-yellow-400 shrink-0" />
              <span className="text-xs font-bold text-slate-700">{avgRating}</span>
              <span className="text-[10px] text-slate-400">
                ({product.reviews?.length || 0})
              </span>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between gap-1 flex-wrap">
              <p className="text-xs sm:text-base font-black text-slate-950">
                {formatPrice(product.price)}
              </p>
              <span className="text-[10px] sm:text-[11px] text-slate-400">Stok: {product.stock}</span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="p-3 sm:p-4 pt-0 border-t border-slate-50 mt-1">
          <div className="mt-2.5 flex items-center gap-1.5 sm:gap-2">
            {/* VISIT STORE BUTTON */}
            {sellerId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/store/${sellerId}`);
                }}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 shrink-0"
                title={`Kunjungi Toko ${sellerName}`}
              >
                <Store size={13} />
                <span className="hidden sm:inline">Toko</span>
              </button>
            )}

            {isOwn ? (
              <span className="flex-1 text-center px-2 py-1.5 text-[10px] sm:text-[11px] font-bold text-amber-600 bg-amber-50 rounded-xl">
                Milik Anda
              </span>
            ) : (
              <>
                {/* ADD TO CART BUTTON */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isGuestUser()) {
                      setGuestModalOpen(true);
                      return;
                    }
                    onAddToCart(product.id, 1);
                  }}
                  disabled={product.stock <= 0}
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-800 transition hover:bg-slate-100 hover:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300 shadow-sm"
                  title="Tambah ke Keranjang"
                >
                  <ShoppingCart size={14} />
                </button>

                {/* BELI SEKARANG BUTTON */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectBuyClick(product, false);
                  }}
                  disabled={product.stock <= 0}
                  className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-slate-950 px-2.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200"
                  title="Beli Langsung Tanpa Masuk Keranjang"
                >
                  <Zap size={13} className="text-amber-400 fill-amber-400" />
                  <span>Beli</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="products" className="bg-[#f7f7f5] py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* TOP SEARCH BAR & ACTIVE FILTER */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Katalog Marketplace
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              {isSeller ? "Pusat Produk & Belanja" : "Semua Produk Pilihan"}
            </h2>
          </div>

          <div className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 sm:py-3 md:w-80 shadow-sm">
            <Search size={17} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama produk, toko..."
              className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* ACTIVE CATEGORY FILTER BADGE */}
        {selectedCategoryId && (
          <div className="mt-4 sm:mt-6 flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-1 text-xs font-bold text-white shadow-sm">
              <Filter size={12} className="text-amber-400" />
              <span className="truncate max-w-[200px]">Kategori: {activeCategoryName}</span>
              <button
                onClick={onResetCategory}
                className="ml-1 rounded-full bg-white/20 p-0.5 hover:bg-white/40"
                title="Reset filter kategori"
              >
                <X size={12} />
              </button>
            </div>
            <button
              onClick={onResetCategory}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold underline"
            >
              Tampilkan Semua Kategori
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-72 sm:h-96 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="mt-8 sm:mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 sm:p-8 text-center">
            <p className="text-xs sm:text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* SELLER VIEW (DUAL SECTION) */}
        {!loading && !error && isSeller && (
          <div className="mt-8 sm:mt-12 space-y-10 sm:space-y-16">
            {/* SECTION 1: BARANG JUALAN ANDA */}
            <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-4 sm:p-6 md:p-8">
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-white">
                    Toko Anda
                  </span>
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-950">Barang Jualan Anda</h3>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-1">
                  Produk milik toko Anda sendiri (tidak dapat dibeli sendiri).
                </p>
              </div>

              {mySellerProducts.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 sm:p-8 text-center">
                  <p className="text-xs sm:text-sm font-semibold text-slate-600">
                    {selectedCategoryId
                      ? `Anda tidak memiliki produk jualan pada kategori "${activeCategoryName}".`
                      : "Anda belum memiliki produk jualan yang cocok dengan pencarian."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {mySellerProducts.map((p) => renderProductCard(p, true))}
                </div>
              )}
            </div>

            {/* SECTION 2: BARANG REKOMENDASI UNTUK ANDA BELI */}
            <div>
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-white">
                    Buyer Mode
                  </span>
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-950">
                    Barang Rekomendasi untuk Anda Beli
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                  Produk dari toko lain yang siap Anda beli dan checkout.
                </p>
              </div>

              {recommendedProducts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center">
                  <p className="text-xs sm:text-sm text-slate-500">
                    {selectedCategoryId
                      ? `Tidak ada produk rekomendasi pada kategori "${activeCategoryName}".`
                      : "Tidak ada produk rekomendasi toko lain yang cocok."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {recommendedProducts.map((p) => renderProductCard(p, false))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CUSTOMER / ADMIN / GUEST VIEW */}
        {!loading && !error && !isSeller && (
          <div className="mt-8 sm:mt-12">
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center">
                <Search className="mx-auto text-slate-400" size={28} />
                <h3 className="mt-3 text-base sm:text-lg font-bold text-slate-900">
                  Produk tidak ditemukan
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedCategoryId
                    ? `Tidak ada produk yang terdaftar pada kategori "${activeCategoryName}".`
                    : "Coba gunakan kata kunci lainnya."}
                </p>
                {selectedCategoryId && (
                  <button
                    onClick={onResetCategory}
                    className="mt-4 rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    Reset Filter Kategori
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((p) => {
                  const isOwn = currentUserId ? p.sellerId === currentUserId : false;
                  return renderProductCard(p, isOwn);
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONFIRMATION BUY DIRECT MODAL */}
      <ConfirmModal
        isOpen={!!confirmBuyProduct}
        title="Konfirmasi Beli Sekarang"
        message="Anda akan langsung diarahkan ke halaman pembayaran untuk produk ini tanpa memasukkannya ke keranjang atau membuka halaman detail. Lanjutkan?"
        confirmText="Beli Sekarang"
        cancelText="Batal"
        itemDetails={
          confirmBuyProduct
            ? {
                name: confirmBuyProduct.name,
                price: confirmBuyProduct.price,
                quantity: 1,
                image: confirmBuyProduct.image,
              }
            : undefined
        }
        onConfirm={handleConfirmDirectBuy}
        onCancel={() => setConfirmBuyProduct(null)}
      />

      {/* GUEST MODAL */}
      <GuestModal
        isOpen={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        message="Silakan Login atau Daftar akun terlebih dahulu untuk melakukan pembelian langsung."
      />
    </section>
  );
}

export default ProductSection;
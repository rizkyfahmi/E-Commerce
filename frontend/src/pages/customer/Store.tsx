import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Package,
  ShoppingCart,
  Star,
  Store as StoreIcon,
  ShieldCheck,
  AlertCircle,
  Zap,
} from "lucide-react";
import { getCurrentUserId, isGuestUser } from "../../lib/auth";
import ConfirmModal from "../../components/ConfirmModal";
import GuestModal from "../../components/GuestModal";


interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  category?: {
    id: string;
    name: string;
  };
  reviews?: { rating: number }[];
}

interface Seller {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface StoreProps {
  onAddToCart?: (productId: string, quantity: number) => void;
  onProductClick?: (product: any) => void;
}

function Store({ onAddToCart, onProductClick }: StoreProps) {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmBuyProduct, setConfirmBuyProduct] = useState<Product | null>(null);
  const [guestModalOpen, setGuestModalOpen] = useState(false);

  const currentUserId = getCurrentUserId();
  const isOwnStore = currentUserId && sellerId ? currentUserId === sellerId : false;

  const handleDirectBuyClick = (product: Product) => {
    if (isGuestUser()) {
      setGuestModalOpen(true);
      return;
    }
    if (isOwnStore) {
      alert("Anda tidak dapat membeli produk dari toko Anda sendiri.");
      return;
    }
    setConfirmBuyProduct(product);
  };

  const handleConfirmDirectBuy = () => {
    if (!confirmBuyProduct || !seller) return;
    const product = confirmBuyProduct;
    setConfirmBuyProduct(null);
    navigate("/checkout", {
      state: {
        directItem: {
          product: {
            ...product,
            seller: {
              id: seller.id,
              fullName: seller.fullName,
              username: seller.username,
            },
          },
          quantity: 1,
        },
      },
    });
  };

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!sellerId) return;
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/product/store/${sellerId}`);
        if (!response.ok) {
          throw new Error("Toko tidak ditemukan atau tidak aktif.");
        }
        const data = await response.json();
        setSeller(data.seller);
        setProducts(data.products || []);
      } catch (err: any) {
        setError(err.message || "Gagal memuat toko.");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [sellerId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateAvgRating = (reviews?: { rating: number }[]) => {
    if (!reviews || reviews.length === 0) return 5.0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-xs sm:text-sm text-slate-500">Memuat informasi toko...</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} /> Kembali ke Beranda
          </Link>
          <div className="mt-8 rounded-3xl bg-white p-6 sm:p-10 shadow-sm">
            <StoreIcon size={48} className="mx-auto text-slate-400" />
            <h2 className="mt-4 text-xl sm:text-2xl font-bold text-slate-900">Toko Tidak Ditemukan</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              {error || "Toko yang Anda cari tidak tersedia."}
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-slate-950 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-slate-800"
            >
              Jelajahi Produk Lain
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] pb-20">
      {/* HEADER BANNER */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={18} /> Kembali ke Beranda
          </Link>

          {/* STORE PROFILE CARD */}
          <div className="mt-4 sm:mt-6 flex flex-col gap-4 sm:gap-6 rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-5 sm:p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl sm:text-3xl font-black text-white backdrop-blur-md border border-white/20">
                {seller.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight md:text-3xl">
                    {seller.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck size={13} /> Official Store
                  </span>
                </div>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-300">@{seller.username}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-5 text-[11px] sm:text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Package size={15} className="text-slate-400" />
                    <span>{products.length} Produk</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={15} className="text-slate-400" />
                    <span>
                      Bergabung{" "}
                      {new Date(seller.createdAt).toLocaleDateString("id-ID", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isOwnStore && (
              <div className="rounded-2xl border border-amber-400/40 bg-amber-500/20 px-4 py-3 text-amber-200">
                <p className="text-xs font-bold uppercase tracking-wider">Toko Anda</p>
                <p className="text-xs mt-0.5">Anda sedang melihat toko milik Anda sendiri.</p>
              </div>
            )}
          </div>

          {/* OWN STORE WARNING BANNER */}
          {isOwnStore && (
            <div className="mt-4 sm:mt-6 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 sm:p-4 text-amber-900 text-xs sm:text-sm">
              <AlertCircle size={20} className="shrink-0 text-amber-600" />
              <div>
                <span className="font-bold">Informasi:</span> Ini adalah toko Anda. Anda tidak
                dapat berbelanja produk toko Anda sendiri.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRODUCTS LIST */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Semua Produk Toko</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Menampilkan {products.length} produk dari {seller.fullName}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="mt-8 sm:mt-10 rounded-3xl bg-white p-8 sm:p-12 text-center shadow-sm">
            <Package size={44} className="mx-auto text-slate-400" />
            <h3 className="mt-3 text-base sm:text-lg font-bold text-slate-900">Belum Ada Produk</h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">Toko ini belum menambahkan produk.</p>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const avgRating = calculateAvgRating(product.reviews);
              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div>
                    {/* IMAGE */}
                    <div
                      onClick={() => {
                        if (onProductClick) {
                          onProductClick({
                            ...product,
                            seller: {
                              id: seller.id,
                              fullName: seller.fullName,
                              username: seller.username,
                            },
                          });
                          navigate("/");
                        }
                      }}
                      className="relative h-40 sm:h-52 w-full cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-slate-100"
                    >
                      <img
                        src={
                          product.image
                            ? product.image.startsWith("http")
                              ? product.image
                              : `${API_BASE_URL}/uploads/${product.image}`
                            : "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=500&auto=format&fit=crop"
                        }
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {/* Stock Badge */}
                      <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-slate-800 backdrop-blur shadow-sm">
                        {product.stock > 0 ? `Stok: ${product.stock}` : "Habis"}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className="mt-3">
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
                        {product.category?.name || "General"}
                      </p>

                      <h3
                        onClick={() => {
                          if (onProductClick) {
                            onProductClick({
                              ...product,
                              seller: {
                                id: seller.id,
                                fullName: seller.fullName,
                                username: seller.username,
                              },
                            });
                            navigate("/");
                          }
                        }}
                        className="mt-1 line-clamp-2 cursor-pointer text-xs sm:text-sm font-bold text-slate-900 transition hover:text-blue-600 leading-snug"
                      >
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
                    </div>
                  </div>

                  {/* PRICE & ACTIONS */}
                  <div className="mt-3 border-t border-slate-50 pt-2.5 flex items-center justify-between gap-1">
                    <p className="text-xs sm:text-base font-black text-slate-950">
                      {formatPrice(product.price)}
                    </p>

                    {isOwnStore ? (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                        Milik Anda
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (isGuestUser()) {
                              setGuestModalOpen(true);
                              return;
                            }
                            if (onAddToCart) {
                              onAddToCart(product.id, 1);
                            }
                          }}
                          disabled={product.stock <= 0}
                          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 shadow-sm"
                          title="Tambah ke Keranjang"
                        >
                          <ShoppingCart size={14} />
                        </button>
                        <button
                          onClick={() => handleDirectBuyClick(product)}
                          disabled={product.stock <= 0}
                          className="flex items-center gap-1 rounded-xl bg-slate-950 px-2.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200"
                          title="Beli Langsung"
                        >
                          <Zap size={13} className="text-amber-400 fill-amber-400" />
                          <span>Beli</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRMATION BUY DIRECT MODAL */}
      <ConfirmModal
        isOpen={!!confirmBuyProduct}
        title="Konfirmasi Beli Sekarang"
        message={`Anda akan langsung diarahkan ke pembayaran untuk produk dari toko "${seller?.fullName || 'Seller'}" tanpa memasukkannya ke keranjang belanja. Lanjutkan?`}
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

      {/* GUEST WARNING MODAL */}
      <GuestModal
        isOpen={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        message="Silakan Login atau Daftar akun terlebih dahulu untuk melakukan pembelian produk."
      />
    </div>
  );
}

export default Store;

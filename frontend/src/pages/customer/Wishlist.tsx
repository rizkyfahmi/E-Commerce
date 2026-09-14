import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: {
    name: string;
  };
}

interface WishlistItem {
  id: string;
  product: Product;
}

function Wishlist() {
  const navigate = useNavigate();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const fetchWishlist = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil wishlist");
      }

      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeWishlist = async (productId: string) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus produk ini dari wishlist?",
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus wishlist");
      }

      setItems((current) => current.filter((item) => item.product.id !== productId));
    } catch (error) {
      console.error("Remove wishlist error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] p-6 sm:p-8">
        <p className="text-center text-xs sm:text-sm text-slate-500">Memuat wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <Link
          to="/"
          className="mb-6 sm:mb-8 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={18} />
          Kembali Belanja
        </Link>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">Wishlist Saya</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {items.length} produk favorit yang Anda simpan.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl bg-white px-4 sm:px-6 py-12 sm:py-16 text-center shadow-sm">
            <Heart size={44} className="mx-auto text-slate-300" />
            <h2 className="mt-4 text-lg sm:text-xl font-bold text-slate-950">
              Wishlist masih kosong
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">Simpan produk favoritmu di sini.</p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 shadow-md"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 sm:h-52 overflow-hidden rounded-xl sm:rounded-2xl bg-slate-100">
                    <img
                      src={
                        item.product.image
                          ? item.product.image.startsWith("http")
                            ? item.product.image
                            : `${API_BASE_URL}/uploads/${item.product.image}`
                          : "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=700&auto=format&fit=crop"
                      }
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />

                    <button
                      onClick={() => removeWishlist(item.product.id)}
                      aria-label="Hapus dari wishlist"
                      className="absolute right-2 top-2 sm:right-3 sm:top-3 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-3">
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
                      {item.product.category?.name || "Product"}
                    </p>

                    <h2 className="mt-1 line-clamp-2 text-xs sm:text-sm font-bold text-slate-950 leading-snug">
                      {item.product.name}
                    </h2>
                  </div>
                </div>

                <div className="mt-3 border-t border-slate-50 pt-2.5 flex items-center justify-between gap-1">
                  <p className="text-xs sm:text-base font-black text-slate-950">
                    {formatPrice(item.product.price)}
                  </p>

                  <Link
                    to="/"
                    className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800"
                    title="Lihat Produk di Beranda"
                  >
                    <ShoppingCart size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
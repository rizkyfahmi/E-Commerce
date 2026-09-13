import { useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUserId } from "../../lib/auth";
import ConfirmModal from "../../components/ConfirmModal";


interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  sellerId?: string;
}

interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

interface CartProps {
  onCartChange?: () => void;
}

function Cart({ onCartChange }: CartProps) {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const token = localStorage.getItem("token");
  const currentUserId = getCurrentUserId();

  const fetchCart = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:3000/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil keranjang");
      }

      const data = await response.json();
      setCartItems(data);
      onCartChange?.();
    } catch (error) {
      console.error("Cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const updateQuantity = async (cartId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const response = await fetch(`http://localhost:3000/cart/${cartId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengubah jumlah");
      }

      await fetchCart();
      onCartChange?.();
    } catch (error) {
      console.error("Update cart error:", error);
    }
  };

  const removeItem = async (cartId: string) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus produk ini dari keranjang?",
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/cart/${cartId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus item");
      }

      await fetchCart();
      onCartChange?.();
    } catch (error) {
      console.error("Remove cart error:", error);
    }
  };

  // Check if any cart item belongs to the currently logged in user
  const hasOwnProductInCart = cartItems.some(
    (item) => currentUserId && item.product.sellerId === currentUserId,
  );

  const totalPrice = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  const totalItems = cartItems.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] p-6 sm:p-8">
        <p className="text-center text-xs sm:text-sm text-slate-500">Memuat keranjang...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/"
            className="mb-4 sm:mb-6 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft size={18} />
            Kembali Belanja
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">Keranjang Saya</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">{totalItems} produk di keranjang</p>
        </div>

        {/* Warning if own product is in cart */}
        {hasOwnProductInCart && (
          <div className="mb-6 flex items-start sm:items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 text-xs sm:text-sm">
            <AlertCircle size={20} className="shrink-0 text-amber-600 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold">Perhatian:</span> Terdapat produk dari toko Anda sendiri
              di dalam keranjang. Anda tidak dapat membeli produk sendiri, silakan hapus produk
              tersebut dari keranjang sebelum melakukan checkout.
            </div>
          </div>
        )}

        {/* Empty */}
        {cartItems.length === 0 ? (
          <div className="rounded-3xl bg-white px-4 sm:px-6 py-12 sm:py-16 text-center shadow-sm">
            <ShoppingBag size={44} className="mx-auto text-slate-300" />
            <h2 className="mt-4 text-lg sm:text-xl font-bold text-slate-950">Keranjang masih kosong</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">Yuk cari produk yang kamu inginkan.</p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 shadow-md"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-[1fr_380px]">
            {/* Items */}
            <div className="space-y-3 sm:space-y-4">
              {cartItems.map((item) => {
                const isOwnItem = currentUserId && item.product.sellerId === currentUserId;
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl bg-white p-4 sm:p-5 shadow-sm border ${
                      isOwnItem ? "border-amber-300 bg-amber-50/30" : "border-slate-100"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                      {/* Image */}
                      <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 self-start">
                        <img
                          src={
                            item.product.image
                              ? item.product.image.startsWith("http")
                                ? item.product.image
                                : `http://localhost:3000/uploads/${item.product.image}`
                              : "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=500&auto=format&fit=crop"
                          }
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                        {isOwnItem && (
                          <span className="absolute bottom-1 left-1 right-1 rounded bg-amber-500 py-0.5 text-center text-[9px] font-bold text-white">
                            Produk Anda
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="text-sm sm:text-base font-bold text-slate-950 line-clamp-2">
                              {item.product.name}
                            </h2>
                            {isOwnItem && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                                Tidak dapat dibeli
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-900">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                          {/* Quantity */}
                          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="flex h-8 w-8 items-center justify-center hover:bg-white rounded-l-xl disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-8 text-center text-xs font-bold">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center hover:bg-white rounded-r-xl"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={15} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div>
              <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-slate-950">Ringkasan Belanja</h2>

                <div className="mt-6 space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Total Produk</span>
                    <span className="font-semibold text-slate-900">{totalItems} item</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Total Harga</span>
                    <span className="font-semibold text-slate-900">{formatPrice(totalPrice)}</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-100 pt-3 text-sm sm:text-base font-extrabold text-slate-950">
                    <span>Total Belanja</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {hasOwnProductInCart ? (
                  <button
                    disabled
                    className="mt-6 w-full rounded-2xl bg-slate-300 py-3.5 text-xs sm:text-sm font-bold text-slate-500 cursor-not-allowed text-center"
                  >
                    Hapus Produk Anda Dahulu
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmModalOpen(true)}
                    className="mt-6 block w-full rounded-2xl bg-slate-950 py-3.5 text-center text-xs sm:text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 cursor-pointer"
                  >
                    Lanjut ke Pembayaran
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION CHECKOUT MODAL */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Konfirmasi Lanjut ke Pembayaran"
        message={`Anda akan melanjutkan proses pesanan untuk ${totalItems} barang di keranjang belanja dengan total ${formatPrice(totalPrice)}. Lanjutkan?`}
        confirmText="Ya, Lanjut ke Pembayaran"
        cancelText="Kembali"
        onConfirm={() => {
          setConfirmModalOpen(false);
          navigate("/checkout");
        }}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </div>
  );
}

export default Cart;
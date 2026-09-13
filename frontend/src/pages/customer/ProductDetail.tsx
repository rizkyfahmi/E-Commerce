import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Store as StoreIcon,
  ShieldCheck,
  AlertCircle,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  categoryId?: string;
  sellerId?: string;
  category?: {
    name: string;
  };
  seller?: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  image?: string;
  video?: string;
  orderId?: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onWishlistChange: (hasWishlist: boolean) => void;
}

interface WishlistItem {
  id: string;
  productId: string;
}

function ProductDetail({
  product,
  onBack,
  onAddToCart,
  onWishlistChange,
}: ProductDetailProps) {
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  const [productData, setProductData] = useState<Product>(product);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAvgRating] = useState(5.0);
  const [filterRating, setFilterRating] = useState<string>("all");

  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistChecking, setWishlistChecking] = useState(true);

  // Buy Now confirmation & Guest modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);

  // Media Zoom modal
  const [activeMediaModal, setActiveMediaModal] = useState<{
    type: "image" | "video";
    url: string;
  } | null>(null);

  const isOwnProduct = currentUserId
    ? productData.sellerId === currentUserId || productData.seller?.id === currentUserId
    : false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Fetch full product details including seller & reviews
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:3000/product/detail/${product.id}`);
        if (res.ok) {
          const data = await res.json();
          setProductData(data);
        }
      } catch (err) {
        console.error("Fetch detail error:", err);
      }
    };

    fetchDetail();
  }, [product.id]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:3000/review/product/${product.id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          setTotalReviews(data.totalReviews || 0);
          setAvgRating(data.avgRating || 5.0);
        }
      } catch (err) {
        console.error("Fetch reviews error:", err);
      }
    };

    fetchReviews();
  }, [product.id]);

  // Check Wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setWishlistChecking(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/wishlist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data: WishlistItem[] = await response.json();
        const exists = data.some((item) => item.productId === product.id);

        setLiked(exists);
        onWishlistChange(data.length > 0);
      } catch (error) {
        console.error("Wishlist check error:", error);
      } finally {
        setWishlistChecking(false);
      }
    };

    checkWishlist();
  }, [product.id]);

  // Toggle Wishlist
  const handleWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setWishlistLoading(true);
      const response = await fetch(`http://localhost:3000/wishlist/${product.id}`, {
        method: liked ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal mengubah wishlist");
      }

      const newLiked = !liked;
      setLiked(newLiked);

      const wishlistResponse = await fetch("http://localhost:3000/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (wishlistResponse.ok) {
        const wishlistData: WishlistItem[] = await wishlistResponse.json();
        onWishlistChange(wishlistData.length > 0);
      } else {
        onWishlistChange(newLiked);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const increaseQuantity = () => {
    if (quantity < productData.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (isGuestUser()) {
      setGuestModalOpen(true);
      return;
    }
    if (isOwnProduct) {
      alert("Anda tidak dapat membeli produk dari toko Anda sendiri.");
      return;
    }
    onAddToCart(productData.id, quantity);
  };

  const handleBuyNow = () => {
    if (isGuestUser()) {
      setGuestModalOpen(true);
      return;
    }
    if (isOwnProduct) {
      alert("Anda tidak dapat membeli produk dari toko Anda sendiri.");
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirmBuyNow = () => {
    setConfirmModalOpen(false);
    navigate("/checkout", {
      state: {
        directItem: {
          product: productData,
          quantity,
        },
      },
    });
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (filterRating === "all") return true;
    if (filterRating === "5") return r.rating === 5;
    if (filterRating === "4") return r.rating === 4;
    if (filterRating === "3") return r.rating === 3;
    if (filterRating === "2") return r.rating === 2;
    if (filterRating === "1") return r.rating === 1;
    if (filterRating === "photo") return !!r.image;
    if (filterRating === "video") return !!r.video;
    return true;
  });

  const sellerId = productData.sellerId || productData.seller?.id;
  const sellerName = productData.seller?.fullName || "Official Seller";

  return (
    <section className="min-h-screen bg-[#f7f7f5] pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        {/* BACK BUTTON */}
        <button
          onClick={onBack}
          className="mb-6 sm:mb-8 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={18} />
          Kembali ke Katalog Produk
        </button>

        {/* PRODUCT OVERVIEW */}
        <div className="grid gap-6 sm:gap-10 rounded-3xl bg-white p-4 sm:p-6 md:p-10 shadow-sm lg:grid-cols-2">
          {/* IMAGE */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={
                productData.image
                  ? productData.image.startsWith("http")
                    ? productData.image
                    : `http://localhost:3000/uploads/${productData.image}`
                  : "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000&auto=format&fit=crop"
              }
              alt={productData.name}
              className="h-64 sm:h-96 lg:h-[500px] w-full object-cover"
            />

            {isOwnProduct && (
              <span className="absolute left-3 top-3 sm:left-5 sm:top-5 rounded-full bg-amber-500 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-white shadow-lg">
                Produk Anda
              </span>
            )}

            {/* WISHLIST BUTTON */}
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading || wishlistChecking}
              aria-label="Wishlist"
              className={`absolute right-3 top-3 sm:right-5 sm:top-5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white shadow-md transition ${
                liked ? "text-red-500" : "text-slate-900"
              } ${wishlistLoading || wishlistChecking ? "cursor-not-allowed opacity-60" : "hover:bg-slate-50"}`}
            >
              <Heart size={20} fill={liked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* INFORMATION */}
          <div className="flex flex-col justify-between">
            <div>
              {/* CATEGORY */}
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
                {productData.category?.name || "Technology"}
              </p>

              {/* NAME */}
              <h1 className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
                {productData.name}
              </h1>

              {/* RATING HEADER */}
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-5 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-yellow-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        fill={star <= Math.round(avgRating) ? "currentColor" : "none"}
                        className={
                          star <= Math.round(avgRating) ? "text-yellow-500" : "text-slate-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900">{avgRating}</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-medium">{totalReviews} Ulasan</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-medium">
                  Stok: <strong className="text-slate-900">{productData.stock}</strong>
                </span>
              </div>

              {/* PRICE */}
              <div className="mt-4 sm:mt-6">
                <p className="text-2xl sm:text-3xl font-black text-slate-950">
                  {formatPrice(productData.price)}
                </p>
              </div>

              {/* STORE INFO & VISIT STORE BUTTON */}
              {sellerId && (
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-bold text-white shadow-sm">
                      {sellerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">{sellerName}</span>
                        <ShieldCheck size={14} className="text-emerald-600" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {isOwnProduct ? "Toko Milik Anda" : "Penjual Terverifikasi"}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/store/${sellerId}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
                  >
                    <StoreIcon size={14} />
                    <span>Kunjungi Toko</span>
                  </Link>
                </div>
              )}

              {/* DESCRIPTION */}
              <div className="mt-5 sm:mt-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Deskripsi Produk
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                  {productData.description || "Tidak ada deskripsi produk."}
                </p>
              </div>
            </div>

            {/* ACTION CONTROLS */}
            <div className="mt-6 sm:mt-8 border-t border-slate-100 pt-6">
              {isOwnProduct ? (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                    <AlertCircle size={17} className="text-amber-600 shrink-0" />
                    Produk Anda Sendiri
                  </div>
                  <p className="mt-1 text-[11px] sm:text-xs text-amber-700">
                    Anda tidak dapat membeli produk dari toko Anda sendiri.
                  </p>
                </div>
              ) : (
                <>
                  {/* QUANTITY PICKER */}
                  <div className="mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700">Kuantitas</span>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                      <button
                        onClick={decreaseQuantity}
                        className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center transition hover:bg-white rounded-l-xl"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-9 sm:w-10 text-center font-bold text-xs sm:text-sm">{quantity}</span>
                      <button
                        onClick={increaseQuantity}
                        className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center transition hover:bg-white rounded-r-xl"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <span className="text-[11px] sm:text-xs text-slate-400">
                      Maks. {productData.stock} unit
                    </span>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row">
                    <button
                      onClick={handleAddToCart}
                      disabled={productData.stock <= 0}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-950 bg-white py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-slate-950 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    >
                      <ShoppingCart size={17} />
                      Tambah ke Keranjang
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={productData.stock <= 0}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Beli Sekarang
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RATING & REVIEWS SECTION */}
        {/* ========================================================================= */}
        <div className="mt-8 sm:mt-12 rounded-3xl bg-white p-4 sm:p-6 md:p-10 shadow-sm">
          <div className="border-b border-slate-100 pb-4 sm:pb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">Penilaian & Ulasan Pembeli</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Ulasan asli dari pembeli terverifikasi yang telah menyelesaikan transaksi.
            </p>
          </div>

          {/* RATING SUMMARY & FILTERS */}
          <div className="mt-6 sm:mt-8 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              {/* BIG SCORE */}
              <div className="flex flex-col items-center justify-center border-b border-slate-200 pb-4 text-center md:border-b-0 md:border-r md:pb-0 md:pr-8 shrink-0">
                <span className="text-4xl sm:text-5xl font-black text-slate-950">{avgRating}</span>
                <div className="mt-2 flex items-center text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      fill={star <= Math.round(avgRating) ? "currentColor" : "none"}
                      className={
                        star <= Math.round(avgRating) ? "text-yellow-500" : "text-slate-300"
                      }
                    />
                  ))}
                </div>
                <span className="mt-1 text-[11px] sm:text-xs font-semibold text-slate-500">
                  dari 5 bintang ({totalReviews} ulasan)
                </span>
              </div>

              {/* FILTER BUTTONS */}
              <div className="flex-1 flex flex-wrap gap-2">
                {[
                  { key: "all", label: "Semua" },
                  { key: "5", label: "⭐ 5 Bintang" },
                  { key: "4", label: "⭐ 4 Bintang" },
                  { key: "3", label: "⭐ 3 Bintang" },
                  { key: "2", label: "⭐ 2 Bintang" },
                  { key: "1", label: "⭐ 1 Bintang" },
                  { key: "photo", label: "🖼️ Dengan Foto" },
                  { key: "video", label: "🎥 Dengan Video" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFilterRating(item.key)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      filterRating === item.key
                        ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* REVIEWS LIST */}
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="py-10 sm:py-14 text-center">
                <Star size={36} className="mx-auto text-slate-300" />
                <p className="mt-3 text-xs sm:text-sm font-semibold text-slate-600">
                  Belum ada ulasan untuk filter ini.
                </p>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm space-y-3"
                >
                  {/* REVIEW HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-800 text-xs">
                        {rev.user?.fullName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <span className="block font-bold text-xs sm:text-sm text-slate-950">
                          {rev.user?.fullName || "Pembeli"}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= rev.rating ? "currentColor" : "none"}
                            className={star <= rev.rating ? "text-yellow-500" : "text-slate-200"}
                          />
                        ))}
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} />
                        Terverifikasi
                      </span>
                    </div>
                  </div>

                  {/* COMMENT */}
                  {rev.comment && (
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {rev.comment}
                    </p>
                  )}

                  {/* MEDIA GALLERY */}
                  {(rev.image || rev.video) && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {rev.image && (
                        <div
                          onClick={() =>
                            setActiveMediaModal({
                              type: "image",
                              url: rev.image!.startsWith("http")
                                ? rev.image!
                                : `http://localhost:3000/uploads/${rev.image}`,
                            })
                          }
                          className="group relative h-20 w-20 sm:h-24 sm:w-24 cursor-pointer overflow-hidden rounded-xl bg-slate-100 border border-slate-200"
                        >
                          <img
                            src={
                              rev.image.startsWith("http")
                                ? rev.image
                                : `http://localhost:3000/uploads/${rev.image}`
                            }
                            alt="Foto Review"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <ImageIcon size={18} />
                          </div>
                        </div>
                      )}

                      {rev.video && (
                        <div
                          onClick={() =>
                            setActiveMediaModal({
                              type: "video",
                              url: rev.video!.startsWith("http")
                                ? rev.video!
                                : `http://localhost:3000/uploads/${rev.video}`,
                            })
                          }
                          className="group relative h-20 w-20 sm:h-24 sm:w-24 cursor-pointer overflow-hidden rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white"
                        >
                          <VideoIcon size={24} className="text-white drop-shadow" />
                          <span className="absolute bottom-1 text-[9px] font-bold bg-black/60 px-1.5 rounded">
                            Video
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MEDIA PREVIEW MODAL */}
      {activeMediaModal && (
        <div
          onClick={() => setActiveMediaModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] max-w-2xl overflow-hidden rounded-3xl bg-black p-2 shadow-2xl"
          >
            <button
              onClick={() => setActiveMediaModal(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X size={18} />
            </button>

            {activeMediaModal.type === "image" ? (
              <img
                src={activeMediaModal.url}
                alt="Review Zoom"
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain mx-auto"
              />
            ) : (
              <video
                src={activeMediaModal.url}
                controls
                autoPlay
                className="max-h-[75vh] w-full rounded-2xl"
              />
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION BUY NOW MODAL */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Konfirmasi Beli Sekarang"
        message="Anda akan langsung diarahkan ke halaman pembayaran untuk produk ini tanpa memasukkannya ke keranjang belanja. Apakah Anda yakin ingin melanjutkan?"
        confirmText="Lanjut ke Pembayaran"
        cancelText="Batal"
        itemDetails={{
          name: productData.name,
          price: productData.price,
          quantity,
          image: productData.image,
        }}
        onConfirm={handleConfirmBuyNow}
        onCancel={() => setConfirmModalOpen(false)}
      />

      {/* GUEST WARNING MODAL */}
      <GuestModal
        isOpen={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        message="Silakan Login atau Daftar akun terlebih dahulu untuk melakukan pembelian produk."
      />
    </section>
  );
}

export default ProductDetail;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SellerLayout from "../../components/seller/SellerLayout";
import {
  Star,
  Search,
  RefreshCw,
  MessageSquare,
  Image as ImageIcon,
  Video,
  User,
  Package,
  CheckCircle2,
  ThumbsUp,
  X,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  image?: string;
  price: number;
  category?: {
    name: string;
  };
}

interface ReviewUser {
  id: string;
  fullName: string;
  username: string;
  avatar?: string;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  image?: string;
  video?: string;
  createdAt: string;
  user: ReviewUser;
  product: Product;
}

interface RatingCounts {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

interface ReviewData {
  reviews: Review[];
  totalReviews: number;
  avgRating: number;
  ratingCounts: RatingCounts;
  withMediaCount: number;
}

function SellerReviews() {
  const [data, setData] = useState<ReviewData>({
    reviews: [],
    totalReviews: 0,
    avgRating: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    withMediaCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "image" | "video";
    url: string;
  } | null>(null);

  const token = localStorage.getItem("token");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/review/seller/my-reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil ulasan toko");
      }

      const resData = await res.json();
      setData(resData);
    } catch (err) {
      console.error("Seller reviews error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Filter reviews
  const filteredReviews = data.reviews.filter((review) => {
    // Star filter
    if (activeFilter === "5" && review.rating !== 5) return false;
    if (activeFilter === "4" && review.rating !== 4) return false;
    if (activeFilter === "3" && review.rating !== 3) return false;
    if (activeFilter === "2" && review.rating !== 2) return false;
    if (activeFilter === "1" && review.rating !== 1) return false;
    if (activeFilter === "MEDIA" && !review.image && !review.video) return false;

    // Search filter
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchBuyer =
      (review.user?.fullName || "").toLowerCase().includes(q) ||
      (review.user?.username || "").toLowerCase().includes(q);
    const matchProduct = (review.product?.name || "").toLowerCase().includes(q);
    const matchComment = (review.comment || "").toLowerCase().includes(q);

    return matchBuyer || matchProduct || matchComment;
  });

  const getMediaUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:3000/uploads/${path}`;
  };

  return (
    <SellerLayout
      title="Ulasan & Penilaian Toko"
      subtitle="Pantau kepuasan pembeli, rating produk toko Anda, dan ulasan foto/video dari customer."
    >
      {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* AVERAGE RATING */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Rating Rata-rata
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <Star size={18} className="fill-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-950">
              {data.avgRating > 0 ? data.avgRating.toFixed(1) : "0.0"}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={
                  star <= Math.round(data.avgRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200"
                }
              />
            ))}
            <span className="text-[11px] font-semibold text-slate-500 ml-1">
              ({data.totalReviews} ulasan)
            </span>
          </div>
        </div>

        {/* TOTAL REVIEWS */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Ulasan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <MessageSquare size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl sm:text-4xl font-black text-slate-950">
            {data.totalReviews}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Dari seluruh transaksi yang telah selesai
          </p>
        </div>

        {/* WITH MEDIA */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ulasan Bergambar
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <ImageIcon size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl sm:text-4xl font-black text-slate-950">
            {data.withMediaCount}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {data.totalReviews > 0
              ? `${Math.round((data.withMediaCount / data.totalReviews) * 100)}% ulasan disertai foto/video`
              : "Foto & video bukti produk"}
          </p>
        </div>

        {/* SATISFACTION RATE */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tingkat Kepuasan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ThumbsUp size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl sm:text-4xl font-black text-slate-950">
            {data.totalReviews > 0
              ? `${Math.round(
                  (((data.ratingCounts[5] || 0) + (data.ratingCounts[4] || 0)) /
                    data.totalReviews) *
                    100,
                )}%`
              : "100%"}
          </p>
          <p className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp size={13} />
            <span>Persentase bintang 4 & 5</span>
          </p>
        </div>
      </div>

      {/* RATING BREAKDOWN & SEARCH */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          {/* STAR BREAKDOWN BARS */}
          <div className="flex-1 max-w-lg space-y-2">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Distribusi Bintang
            </p>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = data.ratingCounts[stars as keyof RatingCounts] || 0;
              const percent =
                data.totalReviews > 0
                  ? Math.round((count / data.totalReviews) * 100)
                  : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-14 shrink-0 font-bold text-slate-700">
                    <span>{stars}</span>
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div className="h-2.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-slate-400 text-[11px]">
                    {count} ({percent}%)
                  </span>
                </div>
              );
            })}
          </div>

          {/* SEARCH & REFRESH */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 flex-1 lg:w-72">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Cari pembeli, produk, ulasan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={fetchReviews}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              title="Muat Ulang"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "ALL", label: `Semua (${data.totalReviews})` },
            { id: "5", label: `5 Bintang (${data.ratingCounts[5] || 0})` },
            { id: "4", label: `4 Bintang (${data.ratingCounts[4] || 0})` },
            { id: "3", label: `3 Bintang (${data.ratingCounts[3] || 0})` },
            { id: "2", label: `2 Bintang (${data.ratingCounts[2] || 0})` },
            { id: "1", label: `1 Bintang (${data.ratingCounts[1] || 0})` },
            { id: "MEDIA", label: `Dengan Foto/Video (${data.withMediaCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeFilter === tab.id
                  ? "bg-slate-950 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <RefreshCw size={24} className="mx-auto text-slate-400 animate-spin" />
            <p className="mt-3 text-xs sm:text-sm text-slate-500 font-semibold">
              Memuat ulasan pembeli...
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <MessageSquare size={40} className="mx-auto text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-900">
              Belum ada ulasan yang sesuai
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {data.totalReviews === 0
                ? "Produk toko Anda belum memiliki ulasan dari pembeli."
                : "Tidak ada ulasan yang cocok dengan filter atau pencarian Anda."}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* BUYER INFO & RATING */}
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 font-bold text-indigo-600 border border-indigo-100 overflow-hidden">
                    {review.user?.avatar ? (
                      <img
                        src={getMediaUrl(review.user.avatar)}
                        alt={review.user.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-950">
                        {review.user?.fullName || review.user?.username || "Pembeli"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} /> Pembeli Terverifikasi
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            className={
                              s <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(review.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ASSOCIATED PRODUCT CARD */}
                {review.product && (
                  <Link
                    to={`/product/${review.product.id}`}
                    target="_blank"
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-2.5 hover:bg-slate-100 transition group self-start max-w-sm"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white border border-slate-200">
                      {review.product.image ? (
                        <img
                          src={getMediaUrl(review.product.image)}
                          alt={review.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Package size={16} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition">
                        {review.product.name}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {formatPrice(review.product.price)}
                      </p>
                    </div>

                    <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 shrink-0 mr-1" />
                  </Link>
                )}
              </div>

              {/* REVIEW COMMENT */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                  {review.comment ? (
                    `"${review.comment}"`
                  ) : (
                    <span className="italic text-slate-400">
                      (Pembeli tidak meninggalkan komentar tertulis)
                    </span>
                  )}
                </p>

                {/* REVIEW MEDIA (IMAGES & VIDEOS) */}
                {(review.image || review.video) && (
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    {review.image && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMedia({
                            type: "image",
                            url: getMediaUrl(review.image!),
                          })
                        }
                        className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 group cursor-pointer shadow-xs hover:opacity-90 transition"
                      >
                        <img
                          src={getMediaUrl(review.image)}
                          alt="Review Foto"
                          className="h-full w-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <ImageIcon size={18} className="text-white" />
                        </div>
                      </button>
                    )}

                    {review.video && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMedia({
                            type: "video",
                            url: getMediaUrl(review.video!),
                          })
                        }
                        className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-900 flex items-center justify-center group cursor-pointer shadow-xs"
                      >
                        <Video size={22} className="text-white" />
                        <span className="absolute bottom-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                          Video
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MEDIA PREVIEW LIGHTBOX MODAL */}
      {selectedMedia && (
        <div
          onClick={() => setSelectedMedia(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] max-w-3xl overflow-hidden rounded-3xl bg-slate-950 shadow-2xl"
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
            >
              <X size={18} />
            </button>

            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt="Review Preview"
                className="max-h-[80vh] w-auto object-contain rounded-2xl"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="max-h-[80vh] w-auto rounded-2xl"
              />
            )}
          </div>
        </div>
      )}
    </SellerLayout>
  );
}

export default SellerReviews;

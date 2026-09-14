import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Star, Store, Trash2, Search } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
  };
  product?: {
    id: string;
    name: string;
    image?: string;
    seller?: {
      id: string;
      fullName: string;
      username: string;
      email: string;
    };
  };
}

function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data ulasan");
      }

      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Reviews error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan.",
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal menghapus ulasan");
      }

      alert("Ulasan berhasil dihapus");
      fetchReviews();
    } catch (error) {
      console.error("Delete review error:", error);
      if (error instanceof Error) alert(error.message);
    }
  };

  // ROBUST SAFE FILTER
  const filteredReviews = reviews.filter((rev) => {
    const matchRating = ratingFilter
      ? Number(rev.rating) === Number(ratingFilter)
      : true;

    if (!search.trim()) return matchRating;

    const query = search.trim().toLowerCase();
    const matchSearch =
      (rev.product?.name || "").toLowerCase().includes(query) ||
      (rev.user?.fullName || "").toLowerCase().includes(query) ||
      (rev.user?.email || "").toLowerCase().includes(query) ||
      (rev.product?.seller?.fullName || "").toLowerCase().includes(query) ||
      (rev.comment || "").toLowerCase().includes(query);

    return matchRating && matchSearch;
  });

  return (
    <AdminLayout
      title="Reviews Moderation"
      subtitle="Kelola ulasan pembeli, toko/penjual terkait, filter rating kepuasan, dan moderasi konten"
    >
      {/* FILTER & SEARCH - DESAIN SERAGAM DENGAN PRODUCTS */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari ulasan, nama produk, pembeli, atau toko..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Rating:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none"
          >
            <option value="">Semua Rating</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
            <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
            <option value="3">⭐⭐⭐ (3 Bintang)</option>
            <option value="2">⭐⭐ (2 Bintang)</option>
            <option value="1">⭐ (1 Bintang)</option>
          </select>
        </div>
      </div>

      {/* REVIEWS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Daftar Ulasan</h2>
            <p className="text-xs text-slate-400">
              Total {filteredReviews.length} ulasan produk
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Produk</th>
                <th className="px-6 py-4 font-semibold">Toko / Seller</th>
                <th className="px-6 py-4 font-semibold">Pembeli</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold">Komentar</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Memuat ulasan...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada ulasan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {rev.product?.name || "Produk"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Store size={14} className="text-indigo-500 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800">
                            {rev.product?.seller?.fullName || "Mitra E-Shop"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {rev.product?.seller?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {rev.user?.fullName || "Pelanggan"}
                        </p>
                        <p className="text-xs text-slate-400">{rev.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < rev.rating ? "currentColor" : "none"}
                            className={
                              i < rev.rating
                                ? "text-amber-500"
                                : "text-slate-200"
                            }
                          />
                        ))}
                        <span className="ml-1 text-xs font-bold text-slate-700">
                          {rev.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs text-xs text-slate-600">
                      {rev.comment || <span className="text-slate-300">Tidak ada komentar</span>}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Hapus Ulasan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Reviews;

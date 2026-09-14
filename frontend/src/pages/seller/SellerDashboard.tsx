import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SellerLayout from "../../components/seller/SellerLayout";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Boxes,
  ArrowRight,
  RefreshCw,
  Award,
  Star,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  status: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
  items: OrderItem[];
}

interface TopProduct {
  id: string;
  name: string;
  image?: string;
  unitsSold: number;
  revenue: number;
}

interface Summary {
  totalOrders: number;
  totalSales: number;
  totalUnitsSold: number;
  topProducts: TopProduct[];
}

function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewsInfo, setReviewsInfo] = useState<{ avgRating: number; totalReviews: number }>({
    avgRating: 0,
    totalReviews: 0,
  });
  const [summary, setSummary] = useState<Summary>({
    totalOrders: 0,
    totalSales: 0,
    totalUnitsSold: 0,
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, summaryRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/product/my-product`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/order/seller`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/order/seller/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/review/seller/my-reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (productsRes.ok) {
        const prodData = await productsRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);
      }

      if (ordersRes.ok) {
        const ordData = await ordersRes.json();
        setOrders(Array.isArray(ordData) ? ordData : []);
      }

      if (summaryRes.ok) {
        const sumData = await summaryRes.json();
        setSummary(sumData);
      }

      if (reviewsRes.ok) {
        const revData = await reviewsRes.json();
        setReviewsInfo({
          avgRating: revData.avgRating || 0,
          totalReviews: revData.totalReviews || 0,
        });
      }
    } catch (error) {
      console.error("Seller dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            Paid
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
            Shipped
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
    }
  };

  return (
    <SellerLayout
      title="Seller Dashboard"
      subtitle="Ringkasan performa penjualan, stok produk, dan pesanan toko Anda"
    >
      {/* STATS CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* TOTAL PRODUK */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Produk Aktif
            </span>
            <Package size={18} className="text-indigo-500" />
          </div>
          <h2 className="mt-2.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {loading ? "..." : products.length}
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">Total katalog toko</p>
        </div>

        {/* TOTAL STOK */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Stok
            </span>
            <Boxes size={18} className="text-amber-500" />
          </div>
          <h2 className="mt-2.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {loading ? "..." : totalStock}
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">Unit barang tersedia</p>
        </div>

        {/* TOTAL PESANAN */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Pesanan Toko
            </span>
            <ShoppingBag size={18} className="text-purple-500" />
          </div>
          <h2 className="mt-2.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {loading ? "..." : summary.totalOrders}
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">
            {summary.totalUnitsSold} unit terjual
          </p>
        </div>

        {/* TOTAL OMZET */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Pendapatan
            </span>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <h2 className="mt-2.5 text-xl sm:text-2xl font-extrabold text-slate-900 truncate">
            {loading ? "..." : formatPrice(summary.totalSales)}
          </h2>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
            Omzet toko terkumpul
          </p>
        </div>

        {/* RATING & ULASAN TOKO */}
        <Link
          to="/seller/reviews"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-600 transition">
              Rating & Ulasan
            </span>
            <Star size={18} className="text-amber-500 fill-amber-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {loading ? "..." : reviewsInfo.avgRating > 0 ? reviewsInfo.avgRating.toFixed(1) : "0.0"}
            </h2>
            <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 group-hover:text-amber-600 transition font-medium flex items-center gap-1">
            <span>{reviewsInfo.totalReviews} ulasan pembeli</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition" />
          </p>
        </Link>
      </div>

      {/* SECTION: PESANAN TERBARU & PRODUK TERLARIS */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* PESANAN TERBARU */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pesanan Masuk Terbaru
              </h2>
              <p className="text-xs text-slate-400">
                Transaksi produk toko kamu yang membutuhkan penanganan
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                title="Muat Ulang"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              <Link
                to="/seller/orders"
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Lihat Semua <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Pembeli</th>
                  <th className="pb-3 font-semibold">Produk</th>
                  <th className="pb-3 font-semibold">Total Toko</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada pesanan masuk.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((ord) => {
                    const sellerTotal = ord.items.reduce(
                      (sum, it) => sum + it.price * it.quantity,
                      0,
                    );
                    const productSummary = ord.items
                      .map((it) => `${it.product?.name} (${it.quantity}x)`)
                      .join(", ");

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 font-mono text-xs font-semibold text-slate-600">
                          #{ord.id.slice(0, 8)}
                        </td>
                        <td className="py-3.5 font-medium text-slate-800">
                          {ord.user?.fullName}
                        </td>
                        <td className="py-3.5 max-w-xs truncate text-xs text-slate-600">
                          {productSummary}
                        </td>
                        <td className="py-3.5 font-bold text-slate-900">
                          {formatPrice(sellerTotal)}
                        </td>
                        <td className="py-3.5">{getStatusBadge(ord.status)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRODUK TERLARIS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Produk Terlaris
              </h2>
              <p className="text-xs text-slate-400">Penjualan tertinggi</p>
            </div>
            <Award size={18} className="text-amber-500" />
          </div>

          <div className="space-y-4">
            {summary.topProducts.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                Belum ada produk yang terjual.
              </p>
            ) : (
              summary.topProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[11px] font-extrabold text-slate-700">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 max-w-[140px] truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {p.unitsSold} unit terjual
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {formatPrice(p.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}

export default SellerDashboard;
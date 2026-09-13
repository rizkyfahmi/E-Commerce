import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

interface RecentOrder {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    fullName: string;
    email: string;
  };
  items?: {
    product?: {
      name: string;
      seller?: {
        fullName: string;
      };
    };
  }[];
}

interface RecentUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface DashboardData {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
  recentUsers: RecentUser[];
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    recentUsers: [],
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data dashboard");
      }

      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            Paid
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
            Shipped
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Ringkasan performa dan metrik utama platform E-Shop"
    >
      {/* STATS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Users */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Customers
            </span>
            <Users size={20} className="text-blue-500" />
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : dashboard.totalUsers}
          </h2>
          <p className="mt-1 text-xs text-slate-500">Pengguna terdaftar</p>
        </div>

        {/* Total Sellers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Sellers
            </span>
            <Store size={20} className="text-indigo-500" />
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : dashboard.totalSellers}
          </h2>
          <p className="mt-1 text-xs text-slate-500">Penjual aktif</p>
        </div>

        {/* Total Products */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Products
            </span>
            <Package size={20} className="text-amber-500" />
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : dashboard.totalProducts}
          </h2>
          <p className="mt-1 text-xs text-slate-500">Total katalog produk</p>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Orders
            </span>
            <ShoppingBag size={20} className="text-purple-500" />
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : dashboard.totalOrders}
          </h2>
          <p className="mt-1 text-xs text-slate-500">Total transaksi</p>
        </div>

        {/* Dompet Admin */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Dompet Admin
            </span>
            <DollarSign size={20} className="text-emerald-500" />
          </div>
          <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
            {loading ? "..." : formatPrice(dashboard.totalRevenue)}
          </h2>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp size={13} /> Komisi 0.1% Pesanan Selesai (Completed)
          </div>
        </div>
      </div>

      {/* RECENT ORDERS & RECENT USERS */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pesanan Terbaru (Aktivitas Real-Time)
              </h2>
              <p className="text-xs text-slate-400">
                Status pesanan disinkronkan langsung sesuai pembaruan dari toko seller
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboard}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                title="Muat Ulang Data"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              <Link
                to="/admin/orders"
                className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950"
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
                  <th className="pb-3 font-semibold">Pelanggan</th>
                  <th className="pb-3 font-semibold">Toko / Seller</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status Real-Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Belum ada pesanan terbaru.
                    </td>
                  </tr>
                ) : (
                  dashboard.recentOrders.map((ord) => {
                    const sellerName =
                      ord.items?.[0]?.product?.seller?.fullName || "Mitra Toko";

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 font-mono text-xs font-semibold text-slate-600">
                          #{ord.id.slice(0, 8)}
                        </td>
                        <td className="py-3.5 font-medium text-slate-800">
                          {ord.user?.fullName || "Pelanggan"}
                        </td>
                        <td className="py-3.5 text-xs text-indigo-600 font-medium">
                          {sellerName}
                        </td>
                        <td className="py-3.5 font-bold text-slate-900">
                          {formatPrice(ord.totalPrice)}
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

        {/* Recent Users */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                User Baru
              </h2>
              <p className="text-xs text-slate-400">Pendaftaran terbaru</p>
            </div>
            <Link
              to="/admin/users"
              className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950"
            >
              Kelola <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {dashboard.recentUsers.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                Belum ada pengguna.
              </p>
            ) : (
              dashboard.recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {u.fullName}
                    </p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                      u.role === "ADMIN"
                        ? "bg-slate-900 text-white"
                        : u.role === "SELLER"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
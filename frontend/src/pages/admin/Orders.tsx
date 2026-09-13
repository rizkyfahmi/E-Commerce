import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Package, Store, User, Search, RefreshCw, Eye } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
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

interface Order {
  id: string;
  totalPrice: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt?: string;
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    username?: string;
  };
  items?: OrderItem[];
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data pesanan");
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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

  // ROBUST FAIL-SAFE FILTER LOGIC
  const filteredOrders = orders.filter((ord) => {
    const cleanStatusFilter = statusFilter.trim().toUpperCase();
    const orderStatus = (ord.status || "").trim().toUpperCase();

    const matchStatus = cleanStatusFilter ? orderStatus === cleanStatusFilter : true;

    if (!search.trim()) return matchStatus;

    const query = search.trim().toLowerCase();
    const matchId = (ord.id || "").toLowerCase().includes(query);
    const matchUser =
      (ord.user?.fullName || "").toLowerCase().includes(query) ||
      (ord.user?.email || "").toLowerCase().includes(query) ||
      (ord.user?.username || "").toLowerCase().includes(query);

    const matchProduct =
      Array.isArray(ord.items) &&
      ord.items.some(
        (it) =>
          (it?.product?.name || "").toLowerCase().includes(query) ||
          (it?.product?.seller?.fullName || "").toLowerCase().includes(query)
      );

    return matchStatus && (matchId || matchUser || matchProduct);
  });

  return (
    <AdminLayout
      title="Orders Management"
      subtitle="Pantau seluruh transaksi pesanan, toko penjual, pembeli, dan status pengiriman"
    >
      {/* FILTER & SEARCH - DESAIN SERAGAM DENGAN PRODUCTS */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID pesanan, nama pembeli, atau toko..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button
            onClick={fetchOrders}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
            title="Muat Ulang"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Daftar Pesanan</h2>
            <p className="text-xs text-slate-400">
              Total {filteredOrders.length} transaksi
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Pembeli</th>
                <th className="px-6 py-4 font-semibold">Toko / Seller</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Memuat data pesanan...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada pesanan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const sellerNames = Array.isArray(ord.items)
                    ? Array.from(
                        new Set(
                          ord.items
                            .map((it) => it?.product?.seller?.fullName)
                            .filter(Boolean),
                        ),
                      )
                    : [];

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-600">
                        #{ord.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {ord.user?.fullName || "Pelanggan"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {ord.user?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Store size={14} className="text-indigo-500 shrink-0" />
                          <span className="font-medium">
                            {sellerNames.length > 0
                              ? sellerNames.join(", ")
                              : "Mitra E-Shop"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatPrice(ord.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(ord.status)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition"
                          title="Lihat Detail Pesanan"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Rincian Pesanan #{selectedOrder.id.slice(0, 8)}
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date(selectedOrder.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>

            {/* CUSTOMER INFO */}
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <User size={20} className="text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Pembeli: {selectedOrder.user?.fullName} (@{selectedOrder.user?.username || "-"})
                  </p>
                  <p className="text-xs text-slate-500">
                    Email: {selectedOrder.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* STATUS INFO NOTICE */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Status Transaksi:</p>
                <p className="text-[11px] text-slate-500">Perubahan status pesanan dikelola secara eksklusif oleh akun Seller terkait.</p>
              </div>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>

            {/* ORDER ITEMS & SELLER INFO */}
            <div className="mt-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Item Produk & Toko Penjual
              </p>
              {(selectedOrder.items || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.product?.name || "Produk"}
                      </p>
                      <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                        <Store size={12} />
                        Toko: {item.product?.seller?.fullName || "Mitra E-Shop"}{" "}
                        <span className="text-slate-400">
                          ({item.product?.seller?.email || "-"})
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                    <p className="text-xs text-slate-400">
                      Subtotal: {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-base font-semibold text-slate-700">
                Total Pembayaran
              </span>
              <span className="text-xl font-extrabold text-slate-950">
                {formatPrice(selectedOrder.totalPrice)}
              </span>
            </div>

            {/* CLOSE BUTTON */}
            <div className="mt-8 text-right">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Orders;

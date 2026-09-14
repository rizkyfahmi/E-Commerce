import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import SellerLayout from "../../components/seller/SellerLayout";
import { Package, Search, User, Eye, RefreshCw, CheckCircle, Truck, Ban, AlertCircle, FileText } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";
import InvoiceModal from "../../components/InvoiceModal";

interface Product {
  id: string;
  name: string;
  image?: string;
  seller?: {
    id?: string;
    fullName?: string;
    username?: string;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: string;
  totalPrice?: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt?: string;
  user: {
    id?: string;
    fullName: string;
    email: string;
    username: string;
    phone?: string;
  };
  items: OrderItem[];
}

function SellerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sellerInvoiceOrder, setSellerInvoiceOrder] = useState<Order | null>(null);
  const [successToast, setSuccessToast] = useState("");
  const [actionModal, setActionModal] = useState<{
    type: "SHIP" | "CANCEL";
    order: Order;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/order/seller`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil pesanan");
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Seller orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleExecuteAction = async () => {
    if (!actionModal) return;
    const { type, order } = actionModal;

    try {
      setActionLoading(true);

      const endpoint =
        type === "SHIP"
          ? `${API_BASE_URL}/order/${order.id}/ship`
          : `${API_BASE_URL}/order/${order.id}/status`;

      const response = await fetch(endpoint, {
        method: type === "SHIP" ? "POST" : "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: type === "CANCEL" ? JSON.stringify({ status: "CANCELLED" }) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memperbarui status pesanan");
      }

      setActionModal(null);
      setSuccessToast(
        type === "SHIP"
          ? `Pesanan #${order.id.slice(0, 8)} berhasil dikirim! Pembeli dapat memantau status pengiriman.`
          : `Pesanan #${order.id.slice(0, 8)} berhasil dibatalkan dan stok dikembalikan.`,
      );
      setTimeout(() => setSuccessToast(""), 4000);

      fetchOrders();
      if (selectedOrder?.id === order.id) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: type === "SHIP" ? "SHIPPED" : "CANCELLED" } : null,
        );
      }
    } catch (error: any) {
      console.error("Action error:", error);
      alert(error.message || "Gagal memproses aksi pesanan.");
    } finally {
      setActionLoading(false);
    }
  };

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
            Selesai
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            Perlu Dikirim
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
            Dikirim
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Belum Bayar
          </span>
        );
    }
  };

  // Counts for tabs
  const paidCount = orders.filter((o) => o.status === "PAID").length;
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  // FILTERED ORDERS
  const filteredOrders = orders.filter((ord) => {
    let matchTab = true;
    if (statusTab === "PAID") matchTab = ord.status === "PAID";
    else if (statusTab === "SHIPPED") matchTab = ord.status === "SHIPPED";
    else if (statusTab === "COMPLETED") matchTab = ord.status === "COMPLETED";
    else if (statusTab === "PENDING") matchTab = ord.status === "PENDING";
    else if (statusTab === "CANCELLED") matchTab = ord.status === "CANCELLED";

    if (!matchTab) return false;
    if (!search.trim()) return true;

    const q = search.trim().toLowerCase();
    const matchId = (ord.id || "").toLowerCase().includes(q);
    const matchUser =
      (ord.user?.fullName || "").toLowerCase().includes(q) ||
      (ord.user?.email || "").toLowerCase().includes(q);
    const matchItems = Array.isArray(ord.items) && ord.items.some((it) =>
      (it.product?.name || "").toLowerCase().includes(q),
    );

    return matchId || matchUser || matchItems;
  });

  return (
    <SellerLayout
      title="Pesanan Masuk (Shopee-Style Center)"
      subtitle="Kelola pesanan masuk toko Anda, atur pengiriman barang, dan pantau status transaksi."
    >
      {/* TOAST SUCCESS */}
      {successToast && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800 shadow-sm animate-fade-in">
          <CheckCircle size={20} className="text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* SHOPEE STYLE STATUS TABS */}
      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar rounded-2xl bg-white p-2 shadow-sm border border-slate-200">
        {[
          { id: "ALL", label: "Semua Pesanan", count: orders.length },
          { id: "PAID", label: "Perlu Dikirim", count: paidCount, highlight: true },
          { id: "SHIPPED", label: "Dikirim" },
          { id: "COMPLETED", label: "Selesai" },
          { id: "PENDING", label: "Belum Bayar", count: pendingCount },
          { id: "CANCELLED", label: "Dibatalkan" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusTab(tab.id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 ${
              statusTab === tab.id
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && tab.count > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  statusTab === tab.id
                    ? tab.highlight
                      ? "bg-amber-400 text-slate-950"
                      : "bg-white/20 text-white"
                    : tab.highlight
                    ? "bg-amber-500 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID pesanan, nama pembeli, atau nama produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          onClick={fetchOrders}
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 transition"
          title="Muat Ulang"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ORDERS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar Pesanan Toko
            </h2>
            <p className="text-xs text-slate-400">
              Total {filteredOrders.length} pesanan pada status ini
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Pembeli</th>
                <th className="px-6 py-4 font-semibold">Produk Toko</th>
                <th className="px-6 py-4 font-semibold">Total Toko</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Aksi Proses</th>
                <th className="px-6 py-4 font-semibold text-right">Detail</th>
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
                    Tidak ada pesanan pada status yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const sellerTotal = order.items.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0,
                  );

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                        #{order.id.slice(0, 8)}
                        <p className="text-[11px] font-normal text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {order.user?.fullName || "Pelanggan"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {order.user?.email}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {(order.items || []).map((item) => (
                            <div key={item.id} className="text-xs text-slate-700">
                              <span className="font-semibold">
                                {item.product?.name}
                              </span>{" "}
                              <span className="text-slate-400">
                                ({item.quantity} × {formatPrice(item.price)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        {formatPrice(sellerTotal)}
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* SHOPEE STYLE ACTIONS */}
                      <td className="px-6 py-4">
                        {order.status === "PAID" && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setActionModal({ type: "SHIP", order })}
                              className="inline-flex items-center gap-1 rounded-xl bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                            >
                              <Truck size={13} className="text-amber-400" />
                              <span>Kirim Pesanan</span>
                            </button>
                            <button
                              onClick={() => setActionModal({ type: "CANCEL", order })}
                              className="rounded-xl border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition cursor-pointer"
                              title="Batalkan Pesanan (Stok Habis)"
                            >
                              <Ban size={14} />
                            </button>
                          </div>
                        )}

                        {order.status === "PENDING" && (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                            Menunggu Pembeli
                          </span>
                        )}

                        {order.status === "SHIPPED" && (
                          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                            Dalam Pengiriman
                          </span>
                        )}

                        {order.status === "COMPLETED" && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            Selesai & Lunas
                          </span>
                        )}

                        {order.status === "CANCELLED" && (
                          <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg">
                            Pesanan Batal
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const total = (order.items || []).reduce(
                                (acc, it) => acc + it.price * it.quantity,
                                0,
                              );
                              setSellerInvoiceOrder({ ...order, totalPrice: total });
                            }}
                            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-950 transition cursor-pointer"
                            title="Cetak Nota / Resi"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                            title="Lihat Detail Pesanan"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
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
                    Pembeli: {selectedOrder.user?.fullName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Email: {selectedOrder.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* SHOPEE ACTION BOX IN MODAL */}
            {selectedOrder.status === "PAID" && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-blue-950">Pesanan Siap Dikirim:</p>
                  <p className="text-[11px] text-blue-700">Pembayaran telah terverifikasi otomatis. Silakan kemas dan kirim barang.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActionModal({ type: "CANCEL", order: selectedOrder })}
                    className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    Batalkan
                  </button>
                  <button
                    onClick={() => setActionModal({ type: "SHIP", order: selectedOrder })}
                    className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Truck size={13} className="inline mr-1.5 text-amber-400" />
                    Kirim Sekarang
                  </button>
                </div>
              </div>
            )}

            {selectedOrder.status === "PENDING" && (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>Menunggu pembeli menyelesaikan pembayaran. Pesanan otomatis berpindah ke Perlu Dikirim saat telah lunas.</span>
              </div>
            )}

            {selectedOrder.status === "SHIPPED" && (
              <div className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-xs font-medium text-purple-800 flex items-center gap-2">
                <Truck size={16} className="text-purple-600 shrink-0" />
                <span>Pesanan dalam perjalanan kurir. Menunggu konfirmasi penerimaan dari pembeli.</span>
              </div>
            )}

            {/* ITEMS */}
            <div className="mt-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Item Produk Toko
              </p>
              {(selectedOrder.items || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 text-sm"
                >
                  <div className="flex items-center gap-3">
                    {item.product?.image ? (
                      <img
                        src={
                          item.product.image.startsWith("http")
                            ? item.product.image
                            : `${API_BASE_URL}/uploads/${item.product.image}`
                        }
                        alt={item.product.name}
                        className="h-11 w-11 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <Package size={18} />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-base font-semibold text-slate-700">
                Total Pendapatan Toko
              </span>
              <span className="text-xl font-extrabold text-slate-950">
                {formatPrice(
                  (selectedOrder.items || []).reduce(
                    (acc, it) => acc + it.price * it.quantity,
                    0,
                  ),
                )}
              </span>
            </div>

            {/* ACTION & CLOSE BUTTONS */}
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const total = (selectedOrder.items || []).reduce(
                    (acc, it) => acc + it.price * it.quantity,
                    0,
                  );
                  setSellerInvoiceOrder({ ...selectedOrder, totalPrice: total });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <FileText size={14} className="text-slate-500" />
                <span>Lihat Nota / Resi</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE / NOTA PENJUALAN MODAL */}
      <InvoiceModal
        isOpen={!!sellerInvoiceOrder}
        onClose={() => setSellerInvoiceOrder(null)}
        order={sellerInvoiceOrder as any}
      />

      {/* CONFIRMATION ACTION MODAL */}
      {actionModal && (
        <ConfirmModal
          isOpen={!!actionModal}
          title={
            actionModal.type === "SHIP"
              ? "Konfirmasi Pengiriman Pesanan"
              : "Konfirmasi Pembatalan Pesanan"
          }
          message={
            actionModal.type === "SHIP"
              ? `Apakah Anda telah mengemas pesanan #${actionModal.order.id.slice(
                  0,
                  8,
                )} dan siap menyerahkannya ke kurir ekspedisi? Status akan diperbarui menjadi 'Dikirim'.`
              : `Apakah Anda yakin ingin membatalkan pesanan #${actionModal.order.id.slice(
                  0,
                  8,
                )}? Stok produk akan dikembalikan ke etalase toko Anda.`
          }
          confirmText={actionModal.type === "SHIP" ? "Ya, Kirim Pesanan" : "Ya, Batalkan Pesanan"}
          cancelText="Kembali"
          confirmVariant={actionModal.type === "SHIP" ? "primary" : "danger"}
          loading={actionLoading}
          onConfirm={handleExecuteAction}
          onCancel={() => setActionModal(null)}
        />
      )}
    </SellerLayout>
  );
}

export default SellerOrders;
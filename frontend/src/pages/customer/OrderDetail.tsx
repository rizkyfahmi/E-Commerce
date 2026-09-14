import { API_BASE_URL } from "../../lib/config";
import {
  ArrowLeft,
  Store,
  Package,
  ShieldCheck,
  Zap,
  Ban,
  CheckCircle,
  AlertCircle,
  Truck,
  AlertTriangle,
  Headphones,
  FileText,
  RotateCcw,
  Clock,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import InvoiceModal from "../../components/InvoiceModal";
import PaymentInstructionsModal from "../../components/PaymentInstructionsModal";
import RefundModal from "../../components/RefundModal";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  sellerId?: string;
  seller?: {
    id: string;
    fullName: string;
    username: string;
    email?: string;
    phone?: string;
  };
  reviews?: { id: string; rating: number }[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: string;
  totalPrice: number;
  status: string;
  shippingAddress?: string;
  shippingCourier?: string;
  shippingCost?: number;
  serviceFee?: number;
  discountAmount?: number;
  voucherCode?: string;
  paymentMethod?: string;
  paymentCode?: string;
  paymentExpiresAt?: string;
  paidAt?: string;
  payLaterTenor?: number;
  payLaterMonthly?: number;
  refundReason?: string;
  refundStatus?: string;
  refundBank?: string;
  refundAccountNumber?: string;
  refundAccountName?: string;
  refundRequestedAt?: string;
  refundProcessedAt?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id?: string;
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
  };
  items: OrderItem[];
}

function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingActionModal, setPendingActionModal] = useState<"PAY" | "CANCEL" | "RECEIVE" | null>(null);
  const [notReceivedModalOpen, setNotReceivedModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Belum Bayar";
      case "PROCESSING":
        return "Sedang Diverifikasi";
      case "PAID":
        return "Sedang Dikemas";
      case "SHIPPED":
        return "Dalam Pengiriman";
      case "COMPLETED":
        return "Selesai";
      case "CANCELLED":
        return "Dibatalkan";
      case "EXPIRED":
        return "Kedaluwarsa";
      case "REFUND_REQUESTED":
        return "Pengajuan Refund";
      case "REFUNDED":
        return "Dana Dikembalikan";
      default:
        return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "PROCESSING":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "PAID":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SHIPPED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      case "EXPIRED":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "REFUND_REQUESTED":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "REFUNDED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/order/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil detail pesanan");
      }

      const data = await response.json();
      setOrder(data);
    } catch (error: any) {
      console.error("Order detail error:", error);
      setErrorMessage(error.message || "Gagal memuat rincian pesanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleExecuteAction = async () => {
    if (!pendingActionModal || !order) return;
    const actionType = pendingActionModal;

    try {
      setActionLoading(true);
      setErrorMessage("");

      let endpoint = "";
      if (actionType === "PAY") {
        endpoint = `${API_BASE_URL}/order/${order.id}/pay`;
      } else if (actionType === "CANCEL") {
        endpoint = `${API_BASE_URL}/order/${order.id}/cancel`;
      } else if (actionType === "RECEIVE") {
        endpoint = `${API_BASE_URL}/order/${order.id}/receive`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memproses pesanan");
      }

      setPendingActionModal(null);
      setToastMessage(
        actionType === "PAY"
          ? "Pembayaran pesanan berhasil! Pesanan sedang dikemas oleh toko penjual."
          : actionType === "CANCEL"
          ? "Pesanan berhasil dibatalkan."
          : "Pesanan telah selesai! Terima kasih telah berbelanja.",
      );
      setTimeout(() => setToastMessage(""), 5000);

      fetchOrder();
    } catch (err: any) {
      console.error("Action error:", err);
      setErrorMessage(err.message || "Gagal memproses aksi pesanan");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] p-6 sm:p-8 flex items-center justify-center">
        <p className="text-center text-xs sm:text-sm text-slate-500">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] p-6 sm:p-8">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <Package size={44} className="mx-auto text-slate-400" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">Pesanan tidak ditemukan</h2>
          <Link
            to="/orders"
            className="mt-5 inline-block rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
          >
            Kembali ke Daftar Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const itemsSubtotal = (order.items || []).reduce(
    (acc, it) => acc + (it.price || 0) * (it.quantity || 1),
    0,
  );

  return (
    <div className="min-h-screen bg-[#f7f7f5] pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
        <Link
          to="/orders"
          className="mb-6 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition"
        >
          <ArrowLeft size={18} />
          Kembali ke Daftar Pesanan
        </Link>

        {/* TOAST FEEDBACK */}
        {toastMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm font-bold text-emerald-800 shadow-sm animate-fade-in">
            <CheckCircle size={20} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs sm:text-sm font-semibold text-red-700 shadow-sm">
            <AlertCircle size={20} className="text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ORDER SUMMARY CARD */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950">
                  Rincian Pesanan
                </h1>
                <span className="font-mono text-xs font-bold text-slate-400">
                  #{order.id.slice(0, 8)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Waktu Transaksi: {new Date(order.createdAt).toLocaleString("id-ID")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setInvoiceModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition shadow-2xs cursor-pointer"
              >
                <FileText size={14} className="text-slate-500" />
                <span>Lihat Nota Pembelian</span>
              </button>

              <span
                className={`inline-block rounded-full border px-3.5 py-1 text-xs font-bold ${getStatusStyle(
                  order.status,
                )}`}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          {/* ACTION BANNER FOR PENDING ORDER */}
          {order.status === "PENDING" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <div>
                <p className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  <Clock size={16} className="text-amber-700" />
                  <span>Menunggu Pembayaran</span>
                </p>
                <p className="text-[11px] sm:text-xs text-amber-800 mt-0.5">
                  Selesaikan pembayaran Anda sebesar {formatPrice(order.totalPrice)} via{" "}
                  <strong>{order.paymentMethod?.replace(/_/g, " ") || "Virtual Account"}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPendingActionModal("CANCEL")}
                  className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <Ban size={13} className="inline mr-1" />
                  Batalkan
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(true)}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm cursor-pointer"
                >
                  <Zap size={13} className="inline mr-1 text-amber-400 fill-amber-400" />
                  Instruksi Bayar
                </button>
              </div>
            </div>
          )}

          {/* ACTION BANNER FOR PAID (SEDANG DIKEMAS) */}
          {order.status === "PAID" && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
              <div className="flex items-center gap-3">
                <Package size={22} className="text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-blue-950">
                    Pembayaran Terverifikasi (Sedang Dikemas)
                  </p>
                  <p className="text-[11px] sm:text-xs text-blue-700 mt-0.5">
                    Penjual sedang menyiapkan pesanan Anda untuk segera diserahkan ke kurir ekspedisi.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRefundModalOpen(true)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
              >
                <RotateCcw size={13} className="inline mr-1 text-slate-500" />
                Ajukan Refund
              </button>
            </div>
          )}

          {/* ACTION BANNER FOR SHIPPED (DIKIRIM / BARANG DITERIMA) */}
          {order.status === "SHIPPED" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4">
              <div className="flex items-center gap-3">
                <Truck size={22} className="text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-indigo-950">
                    Paket Sedang Diantar Kurir
                  </p>
                  <p className="text-[11px] sm:text-xs text-indigo-700 mt-0.5">
                    Silakan konfirmasi jika seluruh barang pesanan sudah Anda terima dengan baik.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setNotReceivedModalOpen(true)}
                  className="rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 transition cursor-pointer"
                >
                  <AlertTriangle size={13} className="inline mr-1 text-amber-600" />
                  Belum Sampai
                </button>

                <button
                  type="button"
                  onClick={() => setPendingActionModal("RECEIVE")}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
                >
                  <CheckCircle size={14} className="inline mr-1.5" />
                  Barang Telah Sampai
                </button>
              </div>
            </div>
          )}

          {/* REFUND STATUS BANNER */}
          {order.status === "REFUND_REQUESTED" && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-xs text-orange-950">
              <div className="flex items-center gap-2.5">
                <RotateCcw size={20} className="text-orange-600 shrink-0" />
                <div>
                  <p className="font-bold">Permohonan Refund Sedang Ditinjau</p>
                  <p className="text-[11px] text-orange-800 mt-0.5">
                    Alasan: {order.refundReason || "Pengajuan pengembalian dana"} • Rekening {order.refundBank} ({order.refundAccountNumber}) a/n {order.refundAccountName}
                  </p>
                </div>
              </div>
              <Link
                to="/support"
                className="rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 shrink-0"
              >
                Bantuan CS
              </Link>
            </div>
          )}

          {order.status === "REFUNDED" && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-xs text-purple-950">
              <CheckCircle size={20} className="text-purple-600 shrink-0" />
              <div>
                <p className="font-bold">Dana Telah Dikembalikan (Refund Selesai)</p>
                <p className="text-[11px] text-purple-800 mt-0.5">
                  Dana sebesar {formatPrice(order.totalPrice)} telah dikembalikan ke rekening {order.refundBank} Anda.
                </p>
              </div>
            </div>
          )}

          {/* PARTICIPANT DETAILS (ALAMAT & PENGIRIMAN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-200/80 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-slate-900">Alamat Pengiriman</p>
              <p className="text-slate-600 leading-relaxed">
                {order.shippingAddress || "Jl. Jenderal Sudirman No. 123, DKI Jakarta, 10220"}
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <p className="font-bold text-slate-900">Metode &amp; Kurir Pengiriman</p>
              <p className="text-slate-600">{order.shippingCourier || "JNE Reguler (2-3 Hari)"}</p>
              <p className="text-[11px] text-slate-500 pt-1">
                Metode Pembayaran:{" "}
                <strong className="text-slate-900">
                  {order.paymentMethod?.replace(/_/g, " ") || "Virtual Account"}
                </strong>
              </p>
            </div>
          </div>

          {/* ITEM LIST */}
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => {
              const sellerId = item.product?.sellerId || item.product?.seller?.id;
              const sellerName = item.product?.seller?.fullName;

              return (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                    <img
                      src={
                        item.product.image
                          ? item.product.image.startsWith("http")
                            ? item.product.image
                            : `${API_BASE_URL}/uploads/${item.product.image}`
                          : "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=500&auto=format&fit=crop"
                      }
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-950 line-clamp-1">
                        {item.product.name}
                      </h3>

                      {sellerName && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                          <Store size={12} />
                          <span>{sellerName}</span>
                          {sellerId && (
                            <Link
                              to={`/store/${sellerId}`}
                              className="text-blue-600 font-semibold hover:underline ml-1"
                            >
                              (Kunjungi Toko)
                            </Link>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-slate-500 mt-1">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm font-black text-slate-950 self-end">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FINANCIAL SUMMARY */}
          <div className="border-t border-slate-100 pt-6 space-y-2.5 text-xs sm:text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Total Harga Produk</span>
              <span className="font-semibold text-slate-950">{formatPrice(itemsSubtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Ongkos Kirim ({order.shippingCourier || "Reguler"})</span>
              <span className="font-semibold text-slate-950">
                {formatPrice(order.shippingCost || 0)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Biaya Layanan &amp; Penanganan</span>
              <span className="font-semibold text-slate-950">
                {formatPrice(order.serviceFee ?? 1000)}
              </span>
            </div>

            {order.discountAmount ? (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Diskon Voucher ({order.voucherCode || "PROMO"})</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            ) : null}

            <div className="flex justify-between border-t border-slate-100 pt-3 text-sm sm:text-base font-black text-slate-950">
              <span>Total Pembayaran</span>
              <span className="text-lg">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>

          {/* BOTTOM ACTIONS / REFUND TRIGGER FOR COMPLETED ORDERS */}
          {(order.status === "COMPLETED" || order.status === "SHIPPED") && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">Ada kendala dengan pesanan ini?</span>
              <button
                type="button"
                onClick={() => setRefundModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <RotateCcw size={13} className="text-slate-500" />
                <span>Ajukan Refund / Bantuan</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-[11px] font-semibold text-emerald-800">
            <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
            <span>Pembayaran terverifikasi dan dilindungi oleh sistem rekening bersama E-Commerce.</span>
          </div>
        </div>
      </div>

      {/* INVOICE / NOTA PEMBELIAN MODAL */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        order={order as any}
      />

      {/* PAYMENT INSTRUCTIONS MODAL */}
      <PaymentInstructionsModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        order={order as any}
        onPaymentSuccess={() => {
          setPaymentModalOpen(false);
          fetchOrder();
        }}
      />

      {/* REFUND REQUEST MODAL */}
      <RefundModal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        orderId={order.id}
        orderTotal={order.totalPrice}
        onRefundSubmitted={() => {
          fetchOrder();
        }}
      />

      {/* CONFIRMATION MODAL */}
      {pendingActionModal && (
        <ConfirmModal
          isOpen={!!pendingActionModal}
          title={
            pendingActionModal === "PAY"
              ? "Konfirmasi Pembayaran Pesanan"
              : pendingActionModal === "CANCEL"
              ? "Konfirmasi Pembatalan Pesanan"
              : "Konfirmasi Pesanan Diterima"
          }
          message={
            pendingActionModal === "PAY"
              ? `Apakah Anda yakin ingin menyelesaikan pembayaran untuk pesanan ini sebesar ${formatPrice(
                  order.totalPrice,
                )}?`
              : pendingActionModal === "CANCEL"
              ? "Apakah Anda yakin ingin membatalkan pesanan ini? Stok produk akan dikembalikan."
              : "Apakah Anda yakin telah menerima seluruh barang pesanan ini dalam kondisi baik? Setelah dikonfirmasi, transaksi ini akan selesai."
          }
          confirmText={
            pendingActionModal === "PAY"
              ? "Bayar Sekarang"
              : pendingActionModal === "CANCEL"
              ? "Ya, Batalkan Pesanan"
              : "Ya, Barang Telah Sampai"
          }
          cancelText="Kembali"
          confirmVariant={pendingActionModal === "CANCEL" ? "danger" : "primary"}
          loading={actionLoading}
          onConfirm={handleExecuteAction}
          onCancel={() => setPendingActionModal(null)}
        />
      )}

      {/* NOT RECEIVED MODAL */}
      {notReceivedModalOpen && (
        <div
          onClick={() => setNotReceivedModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-950">Barang Belum Sampai?</h3>
                <p className="text-[11px] text-slate-400">Bantuan pelacakan &amp; kendala pengiriman</p>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Jika paket pesanan <strong className="text-slate-900">#{order.id.slice(0, 8)}</strong> belum tiba di alamat Anda, kurir kemungkinan masih dalam rute perjalanan atau mengalami kendala cuaca/lapangan.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setNotReceivedModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Tutup &amp; Tunggu
              </button>
              <Link
                to="/support"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                <Headphones size={14} />
                <span>Bantuan CS</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;
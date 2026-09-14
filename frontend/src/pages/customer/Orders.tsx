import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  Star,
  Store,
  Video as VideoIcon,
  Image as ImageIcon,
  X,
  AlertCircle,
  Zap,
  Ban,
  Truck,
  AlertTriangle,
  Headphones,
  FileText,
  RotateCcw,
} from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";
import InvoiceModal from "../../components/InvoiceModal";
import PaymentInstructionsModal from "../../components/PaymentInstructionsModal";
import type { PaymentModalOrder } from "../../components/PaymentInstructionsModal";
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
  reviews?: {
    id: string;
    rating: number;
    comment?: string;
  }[];
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

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<PaymentModalOrder | null>(null);
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<Order | null>(null);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewModalData, setReviewModalData] = useState<{
    productId: string;
    productName: string;
    productImage?: string;
    orderId: string;
  } | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Action Modal State (Pay / Cancel / Receive)
  const [pendingActionModal, setPendingActionModal] = useState<{
    type: "PAY" | "CANCEL" | "RECEIVE";
    order: Order;
  } | null>(null);
  const [notReceivedModal, setNotReceivedModal] = useState<{
    order: Order;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/order`, {
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

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "UNPAID") return order.status === "PENDING" || order.status === "PROCESSING";
    if (activeTab === "PAID") return order.status === "PAID";
    if (activeTab === "SHIPPED") return order.status === "SHIPPED";
    if (activeTab === "RECEIVED") return order.status === "SHIPPED";
    if (activeTab === "COMPLETED") return order.status === "COMPLETED";
    if (activeTab === "CANCELLED") return order.status === "CANCELLED" || order.status === "EXPIRED";
    if (activeTab === "REFUND") return order.status === "REFUND_REQUESTED" || order.status === "REFUNDED";
    return true;
  });

  // Open review modal
  const openReviewModal = (item: OrderItem, orderId: string) => {
    setReviewModalData({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.image,
      orderId,
    });
    setRating(5);
    setComment("");
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setSelectedVideo(null);
    setVideoPreview(null);
    setReviewError("");
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewModalData(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        alert("Ukuran video tidak boleh lebih dari 50MB");
        return;
      }
      setSelectedVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const uploadMediaFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/upload/file`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Gagal mengunggah file media ulasan");
    }

    const data = await res.json();
    return data.filename;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalData) return;

    try {
      setSubmittingReview(true);
      setReviewError("");

      let uploadedImageFilename: string | undefined;
      let uploadedVideoFilename: string | undefined;

      if (selectedPhoto) {
        uploadedImageFilename = await uploadMediaFile(selectedPhoto);
      }

      if (selectedVideo) {
        uploadedVideoFilename = await uploadMediaFile(selectedVideo);
      }

      const res = await fetch(`${API_BASE_URL}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: reviewModalData.productId,
          orderId: reviewModalData.orderId,
          rating,
          comment: comment.trim() || undefined,
          image: uploadedImageFilename,
          video: uploadedVideoFilename,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim ulasan.");
      }

      alert("Ulasan Anda berhasil dikirim! Terima kasih atas penilaiannya.");
      closeReviewModal();
      fetchOrders();
    } catch (err: any) {
      console.error("Submit review error:", err);
      setReviewError(err.message || "Gagal mengirim ulasan");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleExecutePendingAction = async () => {
    if (!pendingActionModal) return;
    const { type, order } = pendingActionModal;

    try {
      setActionLoading(true);

      let endpoint = "";
      if (type === "PAY") {
        endpoint = `${API_BASE_URL}/order/${order.id}/pay`;
      } else if (type === "CANCEL") {
        endpoint = `${API_BASE_URL}/order/${order.id}/cancel`;
      } else if (type === "RECEIVE") {
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
        throw new Error(data.message || "Gagal memproses aksi pesanan");
      }

      setPendingActionModal(null);
      setToastMessage(
        type === "PAY"
          ? `Pembayaran pesanan #${order.id.slice(0, 8)} berhasil! Pesanan sedang dikemas oleh penjual.`
          : type === "CANCEL"
          ? `Pesanan #${order.id.slice(0, 8)} berhasil dibatalkan.`
          : `Pesanan #${order.id.slice(0, 8)} telah selesai! Silakan berikan penilaian.`,
      );
      setTimeout(() => setToastMessage(""), 5000);

      fetchOrders();
    } catch (err: any) {
      console.error("Pending action error:", err);
      alert(err.message || "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-4 sm:px-6 py-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* TOP BAR */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={18} /> Kembali ke Beranda Belanja
        </Link>

        <div className="mt-6 sm:mt-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">Pesanan Saya</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Kelola dan pantau seluruh transaksi pembelian Anda.
            </p>
          </div>
        </div>

        {/* TOAST MESSAGE */}
        {toastMessage && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm font-bold text-emerald-800 shadow-sm animate-fade-in">
            <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* STATUS TABS - SHOPEE STYLE */}
        <div className="mt-6 sm:mt-8 flex gap-2 overflow-x-auto no-scrollbar rounded-2xl bg-white p-2 shadow-sm border border-slate-100">
          {[
            { id: "ALL", label: "Semua" },
            { id: "UNPAID", label: "Belum Bayar" },
            { id: "PAID", label: "Sedang Dikemas" },
            { id: "SHIPPED", label: "Dikirim (Dalam Perjalanan)" },
            { id: "RECEIVED", label: "Barang Diterima" },
            { id: "COMPLETED", label: "Selesai" },
            { id: "CANCELLED", label: "Dibatalkan" },
            { id: "REFUND", label: "Refund / Pengembalian" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition ${
                activeTab === tab.id
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ORDERS LIST */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl bg-white p-8 sm:p-12 text-center shadow-sm">
              <p className="text-xs sm:text-sm text-slate-500">Memuat riwayat pesanan...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-3xl bg-white py-12 sm:py-16 text-center shadow-sm border border-slate-100 px-4">
              <Package size={44} className="mx-auto text-slate-300" />
              <h2 className="mt-4 text-lg sm:text-xl font-bold text-slate-900">Belum Ada Pesanan</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Tidak ada pesanan pada status yang dipilih.
              </p>
              <Link
                to="/"
                className="mt-6 inline-block rounded-xl bg-slate-950 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 shadow-md"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm transition hover:shadow-md"
                >
                  {/* ORDER HEADER */}
                  <div className="flex flex-col justify-between gap-2.5 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] sm:text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`rounded-full border px-3 py-0.5 text-xs font-bold ${getStatusStyle(
                          order.status,
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* ORDER ITEMS */}
                  <div className="divide-y divide-slate-100">
                    {order.items?.map((item) => {
                      const hasReviewed = item.product?.reviews && item.product.reviews.length > 0;
                      const sellerId = item.product?.sellerId || item.product?.seller?.id;
                      const sellerName = item.product?.seller?.fullName;

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex gap-3 sm:gap-4">
                            <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              <img
                                src={
                                  item.product?.image
                                    ? item.product.image.startsWith("http")
                                      ? item.product.image
                                      : `${API_BASE_URL}/uploads/${item.product.image}`
                                    : "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=500&auto=format&fit=crop"
                                }
                                alt={item.product?.name || "Product"}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="flex flex-col justify-center">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-950 line-clamp-1">
                                {item.product?.name || "Produk"}
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
                          </div>

                          {/* ACTION BUTTONS (REVIEW) */}
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {order.status === "COMPLETED" && (
                              hasReviewed ? (
                                <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-700">
                                  <CheckCircle size={13} className="text-emerald-600" />
                                  Sudah Diulas
                                </span>
                              ) : (
                                <button
                                  onClick={() => openReviewModal(item, order.id)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
                                >
                                  <Star size={13} fill="currentColor" className="text-yellow-400" />
                                  <span>Beri Rating & Ulasan</span>
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ORDER FOOTER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4 mt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Total Pembayaran:</span>
                      <span className="text-sm sm:text-base font-black text-slate-950">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {order.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingActionModal({
                                type: "CANCEL",
                                order,
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
                          >
                            <Ban size={13} />
                            <span>Batalkan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentOrder(order as any)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Zap size={13} className="text-amber-400 fill-amber-400" />
                            <span>Instruksi Bayar</span>
                          </button>
                        </>
                      )}

                      {order.status === "PAID" && (
                        <>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                            Sedang dikemas oleh toko
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedRefundOrder(order)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <RotateCcw size={13} />
                            <span>Refund</span>
                          </button>
                        </>
                      )}

                      {order.status === "SHIPPED" && activeTab === "SHIPPED" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
                          <Truck size={14} className="text-indigo-600" />
                          <span>Paket Dalam Perjalanan Kurir</span>
                        </span>
                      )}

                      {order.status === "SHIPPED" && activeTab !== "SHIPPED" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setNotReceivedModal({ order })}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                          >
                            <AlertTriangle size={13} className="text-amber-600" />
                            <span>Barang Belum Sampai</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPendingActionModal({
                                type: "RECEIVE",
                                order,
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
                          >
                            <CheckCircle size={14} />
                            <span>Barang Telah Sampai</span>
                          </button>
                        </>
                      )}

                      {order.status === "REFUND_REQUESTED" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl">
                          <RotateCcw size={13} />
                          <span>Refund Sedang Ditinjau</span>
                        </span>
                      )}

                      {order.status === "REFUNDED" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl">
                          <CheckCircle size={13} />
                          <span>Dana Dikembalikan</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition cursor-pointer"
                      >
                        <FileText size={13} className="text-slate-500" />
                        <span>Nota</span>
                      </button>

                      <Link
                        to={`/order/${order.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
                      >
                        Rincian Pesanan →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REVIEW & RATING MODAL (PHOTOS & VIDEO UPLOAD) */}
      {/* ========================================================================= */}
      {showReviewModal && reviewModalData && (
        <div
          onClick={closeReviewModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] mx-2"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-950">Beri Penilaian & Ulasan</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Bagikan pengalaman belanja Anda untuk membantu pembeli lain.
                </p>
              </div>
              <button
                onClick={closeReviewModal}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* PRODUCT MINI CARD */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-100">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                <img
                  src={
                    reviewModalData.productImage
                      ? reviewModalData.productImage.startsWith("http")
                        ? reviewModalData.productImage
                        : `${API_BASE_URL}/uploads/${reviewModalData.productImage}`
                      : "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=500&auto=format&fit=crop"
                  }
                  alt={reviewModalData.productName}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2">
                {reviewModalData.productName}
              </p>
            </div>

            {reviewError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="mt-5 space-y-5">
              {/* STAR RATING SELECTOR */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Kualitas Produk
                </label>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition hover:scale-110"
                    >
                      <Star
                        size={28}
                        fill={star <= rating ? "currentColor" : "none"}
                        className={star <= rating ? "text-yellow-400" : "text-slate-200"}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs sm:text-sm font-bold text-slate-700">
                    {rating === 5 && "Sangat Bagus ⭐⭐⭐⭐⭐"}
                    {rating === 4 && "Bagus ⭐⭐⭐⭐"}
                    {rating === 3 && "Cukup ⭐⭐⭐"}
                    {rating === 2 && "Kurang ⭐⭐"}
                    {rating === 1 && "Buruk ⭐"}
                  </span>
                </div>
              </div>

              {/* COMMENT TEXT AREA */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Ulasan / Komentar (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tulis kepuasan Anda terhadap kualitas produk, pengiriman, dan pelayanan toko..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm outline-none transition focus:border-slate-950 focus:bg-white"
                />
              </div>

              {/* MEDIA UPLOADS (PHOTO & VIDEO) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* PHOTO UPLOAD */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Foto Produk (Opsional)
                  </label>
                  {photoPreview ? (
                    <div className="relative h-24 sm:h-28 w-full overflow-hidden rounded-2xl border border-slate-200">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPhoto(null);
                          setPhotoPreview(null);
                        }}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-24 sm:h-28 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:bg-slate-100">
                      <ImageIcon size={20} className="text-slate-400" />
                      <span className="mt-1 text-[11px] font-semibold text-slate-600">
                        Tambah Foto
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* VIDEO UPLOAD */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Video Produk (Opsional)
                  </label>
                  {videoPreview ? (
                    <div className="relative h-24 sm:h-28 w-full overflow-hidden rounded-2xl border border-slate-200 bg-black">
                      <video src={videoPreview} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVideo(null);
                          setVideoPreview(null);
                        }}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-24 sm:h-28 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:bg-slate-100">
                      <VideoIcon size={20} className="text-slate-400" />
                      <span className="mt-1 text-[11px] font-semibold text-slate-600">
                        Tambah Video
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 rounded-xl bg-slate-950 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50"
                >
                  {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR PAY / CANCEL / RECEIVE ORDER */}
      {pendingActionModal && (
        <ConfirmModal
          isOpen={!!pendingActionModal}
          title={
            pendingActionModal.type === "PAY"
              ? "Konfirmasi Pembayaran Pesanan"
              : pendingActionModal.type === "CANCEL"
              ? "Konfirmasi Pembatalan Pesanan"
              : "Konfirmasi Pesanan Diterima"
          }
          message={
            pendingActionModal.type === "PAY"
              ? `Apakah Anda yakin ingin menyelesaikan pembayaran untuk pesanan #${pendingActionModal.order.id.slice(
                  0,
                  8,
                )} senilai ${formatPrice(
                  pendingActionModal.order.totalPrice,
                )}? Pesanan Anda akan segera diteruskan ke toko penjual untuk diproses dan dikirim.`
              : pendingActionModal.type === "CANCEL"
              ? `Apakah Anda yakin ingin membatalkan pesanan #${pendingActionModal.order.id.slice(
                  0,
                  8,
                )}? Seluruh stok produk pesanan ini akan dikembalikan secara otomatis.`
              : `Apakah Anda yakin telah menerima seluruh barang pesanan #${pendingActionModal.order.id.slice(
                  0,
                  8,
                )} dalam kondisi baik? Setelah dikonfirmasi, transaksi akan selesai dan Anda dapat memberikan ulasan.`
          }
          confirmText={
            pendingActionModal.type === "PAY"
              ? "Bayar Sekarang"
              : pendingActionModal.type === "CANCEL"
              ? "Ya, Batalkan Pesanan"
              : "Ya, Barang Telah Sampai"
          }
          cancelText="Kembali"
          confirmVariant={pendingActionModal.type === "CANCEL" ? "danger" : "primary"}
          loading={actionLoading}
          onConfirm={handleExecutePendingAction}
          onCancel={() => setPendingActionModal(null)}
        />
      )}

      {/* NOT RECEIVED / DELIVERY ISSUE MODAL */}
      {notReceivedModal && (
        <div
          onClick={() => setNotReceivedModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in scale-in"
          >
            <button
              onClick={() => setNotReceivedModal(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-950">Barang Belum Sampai?</h3>
                <p className="text-[11px] text-slate-400">Bantuan pelacakan & kendala pengiriman</p>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Jika paket pesanan <strong className="text-slate-900">#{notReceivedModal.order.id.slice(0, 8)}</strong> belum tiba di alamat Anda, kurir kemungkinan masih dalam rute perjalanan atau mengalami kendala cuaca/lapangan.
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Truck size={14} className="text-indigo-600" />
                <span>Tips & Langkah Selanjutnya:</span>
              </p>
              <ul className="list-disc list-inside text-slate-500 space-y-1 text-[11px]">
                <li>Cek rincian pesanan dan pastikan alamat pengiriman sudah sesuai.</li>
                <li>Hubungi Customer Service untuk bantuan koordinasi kurir ekspedisi.</li>
                <li>Dana Anda tetap aman dan terlindungi oleh garansi E-Shop.</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setNotReceivedModal(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                Tutup & Tunggu
              </button>
              <Link
                to="/support"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800"
              >
                <Headphones size={14} />
                <span>Bantuan CS</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE / NOTA PEMBELIAN MODAL */}
      <InvoiceModal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder as any}
      />

      {/* PAYMENT INSTRUCTIONS MODAL */}
      <PaymentInstructionsModal
        isOpen={!!selectedPaymentOrder}
        onClose={() => setSelectedPaymentOrder(null)}
        order={selectedPaymentOrder}
        onPaymentSuccess={() => {
          setSelectedPaymentOrder(null);
          fetchOrders();
        }}
      />

      {/* REFUND MODAL */}
      {selectedRefundOrder && (
        <RefundModal
          isOpen={!!selectedRefundOrder}
          onClose={() => setSelectedRefundOrder(null)}
          orderId={selectedRefundOrder.id}
          orderTotal={selectedRefundOrder.totalPrice}
          onRefundSubmitted={() => {
            setSelectedRefundOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}

export default Orders;
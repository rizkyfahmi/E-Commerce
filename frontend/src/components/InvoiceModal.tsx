import { API_BASE_URL } from "../lib/config";
import { useState } from "react";
import {
  Printer,
  X,
  CheckCircle,
  Copy,
  Check,
  Store,
  User,
  CreditCard,
  ShieldCheck,
  FileText,
  MapPin,
  Phone,
  Mail,
  Receipt,
  QrCode,
  Truck,
} from "lucide-react";

export interface InvoiceOrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image?: string;
    seller?: {
      id?: string;
      fullName?: string;
      username?: string;
      email?: string;
      phone?: string;
    };
  };
}

export interface InvoiceOrder {
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
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id?: string;
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
  };
  items: InvoiceOrderItem[];
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: InvoiceOrder | null;
}

export default function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatInvoiceDate = (dateString: string) => {
    const d = new Date(dateString);
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dayName = days[d.getDay()];
    const date = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${dayName}, ${date}/${month}/${year} ${hours}:${minutes} WIB`;
  };

  const invoiceNumber = `INV/${new Date(order.createdAt)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}/ESHOP/${order.id.slice(0, 8).toUpperCase()}`;

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printableElement = document.getElementById("printable-invoice");
    if (!printableElement) {
      window.print();
      return;
    }

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!frameDoc) {
      window.print();
      return;
    }

    const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((el) => el.outerHTML)
      .join("\n");

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>Nota_${invoiceNumber.replace(/[\/\\?%*:|"<>]/g, "_")}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              margin: 0 !important;
              padding: 15mm !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #printable-invoice {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div id="printable-invoice">
            ${printableElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (err) {
        console.error("Print error:", err);
        window.print();
      } finally {
        setTimeout(() => {
          try {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          } catch {}
        }, 2000);
      }
    }, 400);
  };

  const firstSeller = order.items?.[0]?.product?.seller;
  const sellerName = firstSeller?.fullName || firstSeller?.username || "Official Store Partner";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
      case "SHIPPED":
      case "COMPLETED":
        return {
          label: "LUNAS / TERVERIFIKASI",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-300",
          icon: <CheckCircle size={14} className="text-emerald-600 inline mr-1" />,
        };
      case "PENDING":
      case "PROCESSING":
        return {
          label: "MENUNGGU PEMBAYARAN",
          bg: "bg-amber-50 text-amber-700 border-amber-300",
          icon: <Receipt size={14} className="text-amber-600 inline mr-1" />,
        };
      case "REFUNDED":
        return {
          label: "DANA DIKEMBALIKAN (REFUND)",
          bg: "bg-purple-50 text-purple-700 border-purple-300",
          icon: <CheckCircle size={14} className="text-purple-600 inline mr-1" />,
        };
      case "CANCELLED":
      case "EXPIRED":
        return {
          label: "DIBATALKAN / KEDALUWARSA",
          bg: "bg-red-50 text-red-700 border-red-300",
          icon: <X size={14} className="text-red-600 inline mr-1" />,
        };
      default:
        return {
          label: status,
          bg: "bg-slate-50 text-slate-700 border-slate-300",
          icon: null,
        };
    }
  };

  const statusInfo = getStatusBadge(order.status);

  const itemsSubtotal = (order.items || []).reduce(
    (acc, it) => acc + (it.price || 0) * (it.quantity || 1),
    0,
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* TOP BAR ACTION CONTROLS (Hidden during print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-slate-900" />
            <h2 className="text-sm sm:text-base font-black text-slate-900">
              Nota Pembelian &amp; Bukti Transaksi
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
            >
              <Printer size={14} />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE CONTENT AREA */}
        <div
          id="printable-invoice"
          className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-slate-900 font-sans"
        >
          {/* HEADER SECTION */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white font-black text-lg">
                  E
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                    E-COMMERCE STORE
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Marketplace Resmi &amp; Terpercaya Indonesia
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black tracking-wide uppercase ${statusInfo.bg}`}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </span>
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                <p>
                  No. Nota:{" "}
                  <strong className="font-mono text-slate-900">{invoiceNumber}</strong>
                </p>
                <p>
                  Tanggal Transaksi:{" "}
                  <span className="font-semibold text-slate-900">
                    {formatInvoiceDate(order.createdAt)}
                  </span>
                </p>
                {order.paidAt && (
                  <p>
                    Waktu Lunas:{" "}
                    <span className="font-semibold text-emerald-700">
                      {formatInvoiceDate(order.paidAt)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* PARTICIPANTS INFO (BUYER & SELLER) */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-200/80 text-xs">
            {/* BUYER / DITERBITKAN UNTUK */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User size={12} />
                Diterbitkan Untuk:
              </p>
              <p className="font-bold text-slate-950 text-sm">
                {order.user?.fullName || "Pelanggan Setia E-Shop"}
              </p>
              {order.user?.email && (
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Mail size={12} className="text-slate-400" />
                  {order.user.email}
                </p>
              )}
              {order.user?.phone && (
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Phone size={12} className="text-slate-400" />
                  {order.user.phone}
                </p>
              )}
              <div className="pt-1 text-slate-600 flex items-start gap-1.5">
                <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                <span>{order.shippingAddress || "Jl. Jenderal Sudirman No. 123, DKI Jakarta, 10220"}</span>
              </div>
            </div>

            {/* SELLER / PENJUAL & METODE */}
            <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Store size={12} />
                Toko Penjual:
              </p>
              <p className="font-bold text-slate-950 text-sm">{sellerName}</p>
              <p className="text-slate-500">ID Pesanan: #{order.id}</p>

              <div className="pt-1 text-slate-600 flex items-center gap-1.5">
                <CreditCard size={12} className="text-slate-400 shrink-0" />
                <span>
                  Metode:{" "}
                  <strong>{order.paymentMethod?.replace(/_/g, " ") || "Pembayaran Digital"}</strong>
                </span>
              </div>
              <div className="text-slate-600 flex items-center gap-1.5">
                <Truck size={12} className="text-slate-400 shrink-0" />
                <span>
                  Kurir: <strong>{order.shippingCourier || "JNE Reguler"}</strong>
                </span>
              </div>
              <div className="text-slate-600 flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                <span className="text-emerald-700 font-medium">Proteksi Transaksi Aktif</span>
              </div>
            </div>
          </div>

          {/* TABLE OF ITEMS */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-700 font-bold">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Info Produk</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Harga Satuan</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
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
                        <div>
                          <p className="font-bold text-slate-900 leading-snug line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            SKU: PRD-{item.product.id.slice(0, 6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTAL CALCULATION SECTION */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            {/* QR CODE & NOTES */}
            <div className="max-w-sm space-y-3 text-xs text-slate-500">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
                <div className="h-14 w-14 shrink-0 rounded-xl bg-white border border-slate-300 p-1 flex items-center justify-center">
                  <QrCode size={44} className="text-slate-900" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-[11px]">Verifikasi Keaslian Nota</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Pindai QR ini atau masukkan nomor nota di sistem pelacakan untuk validasi keabsahan transaksi.
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                * Nota ini merupakan dokumen bukti transaksi resmi dari E-Commerce. Simpan nota ini sebagai bukti garansi atau pengajuan klaim bantuan.
              </p>
            </div>

            {/* FINANCIAL SUMMARY */}
            <div className="w-full sm:w-80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Produk:</span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(itemsSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ongkos Kirim:</span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(order.shippingCost || 0)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya Layanan:</span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(order.serviceFee ?? 1000)}
                </span>
              </div>
              {order.discountAmount ? (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Diskon Voucher ({order.voucherCode || "PROMO"}):</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t-2 border-slate-950 pt-2.5 text-sm sm:text-base font-black text-slate-950">
                <span>Total Bayar:</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* SIGNATURE / AUTHENTICITY STAMP */}
          <div className="mt-8 pt-6 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="text-[11px] text-slate-400">
              <p>Terima kasih telah berbelanja di E-Commerce Store.</p>
              <p>Layanan Bantuan CS: support@ecommerce.com | 0800-1-ECOMMERCE</p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700">
              <CheckCircle size={14} className="text-emerald-600" />
              <span>Sistem E-Commerce Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS (Hidden during print) */}
        <div className="no-print flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={handleCopyInvoiceNumber}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-600 font-bold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Salin No. Nota</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition cursor-pointer"
            >
              <Printer size={14} />
              <span>Cetak Nota</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

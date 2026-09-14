import { API_BASE_URL } from "../lib/config";
import { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Building2,
  Smartphone,
  QrCode,
  CreditCard,
  Store,
  Clock,
  Zap,
  Lock,
} from "lucide-react";
import PaymentMethodLogo from "./PaymentLogos";

export interface PaymentModalOrder {
  id: string;
  totalPrice: number;
  status: string;
  paymentMethod?: string;
  paymentCode?: string;
  paymentExpiresAt?: string;
  createdAt: string;
  payLaterTenor?: number;
  payLaterMonthly?: number;
}

interface PaymentInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PaymentModalOrder | null;
  onPaymentSuccess?: () => void;
}

export default function PaymentInstructionsModal({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
}: PaymentInstructionsModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<"m_banking" | "atm" | "i_banking" | "retail">("m_banking");
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!order?.paymentExpiresAt && !order?.createdAt) return;

    const targetDate = order.paymentExpiresAt
      ? new Date(order.paymentExpiresAt).getTime()
      : new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  if (!isOpen || !order) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCopy = (text: string, type: "code" | "amount") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const handleSimulatePayment = async () => {
    try {
      setSimulatingPayment(true);
      const response = await fetch(`${API_BASE_URL}/order/${order.id}/pay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal memproses pembayaran simulasi");
      }

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      onClose();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memverifikasi pembayaran");
    } finally {
      setSimulatingPayment(false);
    }
  };

  const method = order.paymentMethod || "BCA_VA";

  const getMethodTitle = (m: string) => {
    switch (m) {
      case "BCA_VA":
        return { name: "BCA Virtual Account", icon: <Building2 className="text-blue-600" size={20} /> };
      case "MANDIRI_VA":
        return { name: "Mandiri Virtual Account", icon: <Building2 className="text-yellow-600" size={20} /> };
      case "BRI_VA":
        return { name: "BRI Virtual Account (BRIVA)", icon: <Building2 className="text-blue-500" size={20} /> };
      case "BNI_VA":
        return { name: "BNI Virtual Account", icon: <Building2 className="text-orange-600" size={20} /> };
      case "PERMATA_VA":
        return { name: "Permata Virtual Account", icon: <Building2 className="text-emerald-600" size={20} /> };
      case "GOPAY":
        return { name: "GoPay E-Wallet", icon: <Smartphone className="text-sky-500" size={20} /> };
      case "OVO":
        return { name: "OVO E-Wallet", icon: <Smartphone className="text-purple-600" size={20} /> };
      case "SHOPEEPAY":
        return { name: "ShopeePay", icon: <Smartphone className="text-orange-500" size={20} /> };
      case "DANA":
        return { name: "DANA E-Wallet", icon: <Smartphone className="text-blue-600" size={20} /> };
      case "QRIS":
        return { name: "QRIS (Semua Bank & E-Wallet)", icon: <QrCode className="text-slate-900" size={20} /> };
      case "CREDIT_CARD":
        return { name: "Kartu Debit / Kredit (Visa / Mastercard)", icon: <CreditCard className="text-indigo-600" size={20} /> };
      case "INDOMARET":
        return { name: "Gerai Indomaret", icon: <Store className="text-blue-600" size={20} /> };
      case "ALFAMART":
        return { name: "Gerai Alfamart / Alfamidi", icon: <Store className="text-red-600" size={20} /> };
      case "SPAYLATER":
        return { name: "SPayLater (Cicilan OJK)", icon: <Zap className="text-orange-500" size={20} /> };
      case "KREDIVO":
        return { name: "Kredivo PayLater (OJK)", icon: <Zap className="text-blue-600" size={20} /> };
      default:
        return { name: "Transfer Bank / Virtual Account", icon: <Building2 className="text-slate-700" size={20} /> };
    }
  };

  const methodInfo = getMethodTitle(method);
  const paymentCode = order.paymentCode || "8800812398475891";

  const isQris = method === "QRIS";
  const isEwallet = ["GOPAY", "OVO", "SHOPEEPAY", "DANA"].includes(method);
  const isRetail = ["INDOMARET", "ALFAMART"].includes(method);
  const isPayLater = ["SPAYLATER", "KREDIVO"].includes(method);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto flex max-h-[92vh] w-full max-w-xl flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <PaymentMethodLogo method={method} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-950">
                Instruksi Pembayaran
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">{methodInfo.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* COUNTDOWN TIMER */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-300/60 p-4">
            <div className="flex items-center gap-2.5">
              <Clock size={18} className="text-amber-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-950">Selesaikan Pembayaran Dalam</p>
                <p className="text-[11px] text-amber-800">
                  Pesanan otomatis dibatalkan jika waktu berakhir
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-sm sm:text-base font-black text-amber-950">
              <span className="rounded-lg bg-amber-500/20 px-2 py-1">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="rounded-lg bg-amber-500/20 px-2 py-1">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="rounded-lg bg-amber-500/20 px-2 py-1">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* TOTAL PAYMENT & CODE BOX */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
            {/* TOTAL AMOUNT */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total Nominal Pembayaran</p>
                <p className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">
                  {formatPrice(order.totalPrice)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(order.totalPrice.toString(), "amount")}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                {copiedAmount ? (
                  <>
                    <Check size={13} className="text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-slate-200/80 pt-4">
              {/* QRIS VIEW */}
              {isQris ? (
                <div className="flex flex-col items-center text-center p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="p-2 bg-white border border-slate-300 rounded-2xl shadow-sm">
                    <QrCode size={160} className="text-slate-900" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Scan QRIS untuk Membayar</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Buka aplikasi BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, atau DANA Anda dan pilih Scan QRIS.
                    </p>
                  </div>
                </div>
              ) : (
                /* CODE / VA / RETAIL CODE VIEW */
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    {isRetail
                      ? "Kode Pembayaran Kasir"
                      : isEwallet
                      ? "Kode Verifikasi E-Wallet"
                      : isPayLater
                      ? "Kode Kontrak PayLater"
                      : "Nomor Virtual Account"}
                  </p>
                  <div className="flex items-center justify-between rounded-xl bg-white border border-slate-300 p-3 shadow-2xs">
                    <span className="font-mono text-base sm:text-lg font-black tracking-wider text-slate-950">
                      {paymentCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentCode, "code")}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                      {copiedCode ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Salin No</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PAYLATER TENOR DETAILS IF APPLICABLE */}
            {isPayLater && order.payLaterTenor && (
              <div className="rounded-xl bg-blue-50/80 border border-blue-200 p-3 text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Zap size={14} className="text-blue-600" />
                  <span>Rincian Tenor PayLater ({order.payLaterTenor} Bulan)</span>
                </p>
                <div className="flex justify-between text-[11px] pt-1">
                  <span>Cicilan per bulan:</span>
                  <strong className="text-slate-950">
                    {formatPrice(order.payLaterMonthly || order.totalPrice / order.payLaterTenor)} / bln
                  </strong>
                </div>
                <p className="text-[10px] text-blue-700 pt-1">
                  * Layanan pembiayaan berizin dan diawasi oleh Otoritas Jasa Keuangan (OJK).
                </p>
              </div>
            )}
          </div>

          {/* PAYMENT INSTRUCTION TABS & STEPS */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Petunjuk Pembayaran
            </h4>

            <div className="flex border-b border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveGuideTab("m_banking")}
                className={`py-2 px-3 font-bold border-b-2 transition ${
                  activeGuideTab === "m_banking"
                    ? "border-slate-950 text-slate-950"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                Mobile Banking
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab("atm")}
                className={`py-2 px-3 font-bold border-b-2 transition ${
                  activeGuideTab === "atm"
                    ? "border-slate-950 text-slate-950"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                ATM
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab("i_banking")}
                className={`py-2 px-3 font-bold border-b-2 transition ${
                  activeGuideTab === "i_banking"
                    ? "border-slate-950 text-slate-950"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                Internet Banking
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-xs text-slate-600">
              {activeGuideTab === "m_banking" && (
                <ol className="list-decimal list-inside space-y-2 text-[11px] leading-relaxed">
                  <li>Buka aplikasi Mobile Banking bank Anda dan login.</li>
                  <li>Pilih menu <strong>Transfer</strong> &gt; <strong>Virtual Account / Antar Bank</strong>.</li>
                  <li>Masukkan nomor tagihan: <strong className="font-mono text-slate-900">{paymentCode}</strong>.</li>
                  <li>Periksa nama penerima dan nominal pembayaran sebesar <strong>{formatPrice(order.totalPrice)}</strong>.</li>
                  <li>Masukkan PIN Mobile Banking Anda dan konfirmasi pembayaran.</li>
                  <li>Transaksi berhasil! Status pesanan otomatis diperbarui ke Sedang Dikemas.</li>
                </ol>
              )}

              {activeGuideTab === "atm" && (
                <ol className="list-decimal list-inside space-y-2 text-[11px] leading-relaxed">
                  <li>Masukkan kartu ATM dan PIN Anda di mesin ATM terdekat.</li>
                  <li>Pilih menu <strong>Transaksi Lainnya</strong> &gt; <strong>Transfer</strong> &gt; <strong>Ke Rekening Virtual Account</strong>.</li>
                  <li>Masukkan nomor Virtual Account: <strong className="font-mono text-slate-900">{paymentCode}</strong>.</li>
                  <li>Pastikan nominal yang muncul sama persis dengan total tagihan Anda.</li>
                  <li>Tekan <strong>Benar / Ya</strong> untuk menyelesaikan transaksi. Simpan struk bukti transfer.</li>
                </ol>
              )}

              {activeGuideTab === "i_banking" && (
                <ol className="list-decimal list-inside space-y-2 text-[11px] leading-relaxed">
                  <li>Buka web Internet Banking bank Anda dan lakukan otentikasi login.</li>
                  <li>Pilih menu <strong>Pembayaran &amp; Transfer</strong> &gt; <strong>Virtual Account</strong>.</li>
                  <li>Input nomor tagihan: <strong className="font-mono text-slate-900">{paymentCode}</strong>.</li>
                  <li>Lakukan verifikasi menggunakan App2Pay / Token / SMS OTP Anda.</li>
                  <li>Pembayaran selesai seketika.</li>
                </ol>
              )}
            </div>
          </div>

          {/* SECURITY BADGE */}
          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-100 p-3 text-[11px] text-slate-600">
            <Lock size={16} className="text-slate-800 shrink-0" />
            <span>
              Transaksi Anda dilindungi enkripsi 256-bit SSL dan diproses melalui mitra resmi yang terdaftar &amp; diawasi oleh Bank Indonesia / OJK.
            </span>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Nanti Saja (Tutup)
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={simulatingPayment}
              onClick={handleSimulatePayment}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
            >
              <Zap size={14} className="text-amber-300 fill-amber-300" />
              <span>{simulatingPayment ? "Memverifikasi..." : "⚡ Simulasi Bayar Berhasil (Sandbox)"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

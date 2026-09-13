import React, { useState } from "react";
import {
  X,
  RotateCcw,
  AlertCircle,
  Building2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderTotal: number;
  onRefundSubmitted?: () => void;
}

export default function RefundModal({
  isOpen,
  onClose,
  orderId,
  orderTotal,
  onRefundSubmitted,
}: RefundModalProps) {
  const [reason, setReason] = useState("Produk Rusak / Cacat saat Diterima");
  const [customReason, setCustomReason] = useState("");
  const [bank, setBank] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem("token");

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!accountNumber.trim() || !accountName.trim()) {
      setError("Silakan lengkapi nomor rekening dan nama pemilik rekening pengembalian dana.");
      return;
    }

    const finalReason = reason === "Lainnya" ? customReason : `${reason}${customReason ? `: ${customReason}` : ""}`;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/order/${orderId}/request-refund`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: finalReason,
          bank,
          accountNumber,
          accountName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengajukan pengembalian dana");
      }

      setSuccess(true);
      setTimeout(() => {
        if (onRefundSubmitted) {
          onRefundSubmitted();
        }
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengajukan refund");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
            <RotateCcw size={20} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-950">
              Pengajuan Pengembalian Dana (Refund)
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Pesanan #{orderId.slice(0, 8)} • Nominal {formatPrice(orderTotal)}
            </p>
          </div>
        </div>

        {success ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2 animate-in scale-in">
            <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
            <h4 className="text-sm font-black text-emerald-900">
              Pengajuan Refund Berhasil Dikirim!
            </h4>
            <p className="text-xs text-emerald-700">
              Tim kami akan memverifikasi permohonan Anda maksimal 1x24 jam kerja.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitRefund} className="mt-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Alasan Pengembalian Dana
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Produk Rusak / Cacat saat Diterima">Produk Rusak / Cacat saat Diterima</option>
                <option value="Pesanan Tidak Sesuai Deskripsi / Foto">Pesanan Tidak Sesuai Deskripsi / Foto</option>
                <option value="Barang Kurang / Tidak Lengkap">Barang Kurang / Tidak Lengkap</option>
                <option value="Pesanan Tidak Pernah Sampai">Pesanan Tidak Pernah Sampai</option>
                <option value="Kesepakatan Pembatalan dengan Penjual">Kesepakatan Pembatalan dengan Penjual</option>
                <option value="Lainnya">Alasan Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Catatan Penjelasan Kendala (Opsional)
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Jelaskan kendala yang dialami secara singkat..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* REKENING TUJUAN REFUND */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 size={14} className="text-slate-700" />
                <span>Rekening Tujuan Pengembalian Dana</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Bank / E-Wallet
                  </label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="BCA">Bank BCA</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BRI">Bank BRI</option>
                    <option value="BNI">Bank BNI</option>
                    <option value="GoPay">GoPay (No HP)</option>
                    <option value="OVO">OVO (No HP)</option>
                    <option value="DANA">DANA (No HP)</option>
                    <option value="ShopeePay">ShopeePay (No HP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    No. Rekening / No. HP
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Contoh: 1234567890"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Sesuai buku tabungan / akun"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span>Dana akan dikembalikan 100% setelah permohonan disetujui.</span>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? "Mengirim Pengajuan..." : "Kirim Pengajuan Refund"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

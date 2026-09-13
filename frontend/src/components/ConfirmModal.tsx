import { AlertCircle, CheckCircle2, ShoppingBag, X } from "lucide-react";
import React from "react";

interface ItemDetails {
  name: string;
  price?: number;
  quantity?: number;
  image?: string;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger" | "success";
  itemDetails?: ItemDetails;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  confirmVariant = "primary",
  itemDetails,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all scale-in duration-200"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                confirmVariant === "danger"
                  ? "bg-red-50 text-red-600"
                  : confirmVariant === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-900 text-white"
              }`}
            >
              {confirmVariant === "danger" ? (
                <AlertCircle size={20} />
              ) : confirmVariant === "success" ? (
                <CheckCircle2 size={20} />
              ) : (
                <ShoppingBag size={20} />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">{title}</h3>
              <p className="text-[11px] text-slate-400">Konfirmasi tindakan Anda</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{message}</p>

          {/* ITEM DETAILS CARD IF PROVIDED */}
          {itemDetails && (
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
              {itemDetails.image && (
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white border border-slate-200">
                  <img
                    src={
                      itemDetails.image.startsWith("http")
                        ? itemDetails.image
                        : `http://localhost:3000/uploads/${itemDetails.image}`
                    }
                    alt={itemDetails.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                  {itemDetails.name}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs">
                  {itemDetails.quantity && (
                    <span className="text-slate-500 font-medium">
                      {itemDetails.quantity} unit
                    </span>
                  )}
                  {itemDetails.price !== undefined && (
                    <span className="font-extrabold text-slate-950">
                      {formatPrice(itemDetails.price * (itemDetails.quantity || 1))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center gap-2.5 border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition shadow-sm"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-md disabled:opacity-50 transition ${
              confirmVariant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : confirmVariant === "success"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-slate-950 hover:bg-slate-800"
            }`}
          >
            {loading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

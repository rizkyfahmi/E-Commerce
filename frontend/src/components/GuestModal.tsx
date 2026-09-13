import { ShieldAlert, LogIn, UserPlus, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function GuestModal({
  isOpen,
  onClose,
  title = "Masuk atau Daftar Akun",
  message = "Silakan Login atau Register terlebih dahulu untuk menggunakan fitur ini (menambah keranjang, belanja, wishlist, atau ulasan).",
}: GuestModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl text-center border border-slate-100"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* ICON & BADGE */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 shadow-inner">
          <ShieldAlert size={32} />
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
          <Sparkles size={13} className="text-amber-500" />
          Mode Tamu (Guest Mode)
        </div>

        <h3 className="mt-3 text-xl font-extrabold text-slate-950 tracking-tight">
          {title}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {message}
        </p>

        {/* ACTION BUTTONS */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => {
              onClose();
              navigate("/login");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
          >
            <LogIn size={16} />
            <span>Masuk ke Akun (Login)</span>
          </button>

          <button
            onClick={() => {
              onClose();
              navigate("/register");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-950 bg-white py-3 text-xs sm:text-sm font-bold text-slate-950 transition hover:bg-slate-50"
          >
            <UserPlus size={16} />
            <span>Daftar Akun Baru (Register)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full pt-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
          >
            Lanjut Menjelajah Katalog sebagai Tamu
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuestModal;

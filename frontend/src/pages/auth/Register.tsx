import { API_BASE_URL } from "../../lib/config";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SocialLoginModal, { type SocialProviderData } from "../../components/SocialLoginModal";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Phone,
  Mail,
  User,
  ShieldAlert,
  ShoppingBag,
  Store,
  Info,
  X,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "SELLER">("CUSTOMER");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Provider Status Modal
  const [activeInfoModal, setActiveInfoModal] = useState<{
    name: string;
    description: string;
    requirement: string;
  } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (!phone.trim() && !email.trim()) {
      setError("Nomor telepon atau email wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (!agreeTerms) {
      setError("Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() ? email.trim().toLowerCase() : undefined,
          password: password.trim(),
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal melakukan registrasi.");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Pendaftaran akun berhasil! Selamat datang di E-Shop.");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat registrasi.");
    } finally {
      setLoading(false);
    }
  };

  // Social Login Modal State
  const [activeSocialModal, setActiveSocialModal] = useState<SocialProviderData | null>(null);

  // Provider Data definitions
  const socialProviders: Record<string, SocialProviderData> = {
    google: {
      id: "google",
      name: "Google",
      color: "#4285F4",
      iconBg: "bg-white",
      defaultEmail: "fahmi.google@gmail.com",
      defaultName: "Fahmi Google Account",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      svg: (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
      ),
    },
    facebook: {
      id: "facebook",
      name: "Facebook",
      color: "#1877F2",
      iconBg: "bg-blue-50",
      defaultEmail: "user.facebook@gmail.com",
      defaultName: "Facebook User",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
      svg: (
        <svg className="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    apple: {
      id: "apple",
      name: "Apple",
      color: "#000000",
      iconBg: "bg-slate-100",
      defaultEmail: "user.apple@icloud.com",
      defaultName: "Apple User",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      svg: (
        <svg className="h-5 w-5 fill-black" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2.03.62-2.67 1.37-.56.65-.95 1.71-.82 2.74 1.01.08 2.06-.55 2.57-1.24z" />
        </svg>
      ),
    },
  };

  const handleOAuthRegisterClick = async (providerId: string, providerName: string) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/auth/oauth/${providerId}/url`);
      const data = await res.json();

      if (data.configured && data.url) {
        window.location.href = data.url;
      } else {
        const providerData = socialProviders[providerId];
        if (providerData) {
          setActiveSocialModal(providerData);
        } else {
          setActiveInfoModal({
            name: providerName,
            description: `Pendaftaran akun otomatis via ${providerName} telah siap di backend.`,
            requirement: `Untuk mengaktifkan registrasi ${providerName} secara live, masukkan Client ID dan Secret ke file .env backend (${providerId.toUpperCase()}_CLIENT_ID dan ${providerId.toUpperCase()}_CLIENT_SECRET).`,
          });
        }
      }
    } catch (err) {
      const providerData = socialProviders[providerId];
      if (providerData) {
        setActiveSocialModal(providerData);
      } else {
        setError(`Gagal menghubungi server otentikasi ${providerName}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* TOP BRANDING & BACK BUTTON */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Beranda
          </Link>

          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white shadow-sm">
              E
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-sm">E-Shop</span>
          </Link>
        </div>

        {/* REGISTER CARD */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Buat Akun Baru
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
              Mulai belanja dan transaksi aman di marketplace kami.
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* MAIN FORM */}
          <form onSubmit={handleRegister} className="mt-6 space-y-3.5">
            {/* ROLE SELECTOR */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Daftar Sebagai *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("CUSTOMER")}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-2.5 text-xs font-bold transition ${
                    role === "CUSTOMER"
                      ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <ShoppingBag size={14} />
                  <span>Pembeli (Buyer)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("SELLER")}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-2.5 text-xs font-bold transition ${
                    role === "SELLER"
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Store size={14} />
                  <span>Penjual (Seller)</span>
                </button>
              </div>
            </div>

            {/* FULL NAME */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Nama Lengkap *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-slate-950 focus:bg-white"
                  required
                />
                <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* PHONE NUMBER */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Nomor Telepon (WhatsApp/SMS) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-slate-950 focus:bg-white"
                  required
                />
                <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Alamat Email (Opsional)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-slate-950 focus:bg-white"
                />
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Kata Sandi (Min. 6 Karakter) *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Buat kata sandi aman"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs sm:text-sm outline-none transition focus:border-slate-950 focus:bg-white"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Konfirmasi Kata Sandi *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-slate-950 focus:bg-white"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* TERMS CHECKBOX */}
            <div className="flex items-start pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
              />
              <label htmlFor="terms" className="ml-2 text-[11px] text-slate-600 leading-tight">
                Saya menyetujui <span className="font-bold text-slate-900">Syarat & Ketentuan</span> serta <span className="font-bold text-slate-900">Kebijakan Privasi</span> E-Shop Marketplace.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreeTerms}
              className="mt-2 w-full rounded-2xl bg-slate-950 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Mendaftarkan Akun..." : "Daftar Sekarang"}
            </button>
          </form>

          {/* SOCIAL DIVIDER */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              atau daftar dengan
            </span>
          </div>

          {/* SOCIAL BUTTONS */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleOAuthRegisterClick("google", "Google")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-2.5 px-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthRegisterClick("facebook", "Facebook")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-2.5 px-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
            >
              <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="hidden sm:inline">Facebook</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthRegisterClick("apple", "Apple")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-2.5 px-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
            >
              <svg className="h-4 w-4 fill-black" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2.03.62-2.67 1.37-.56.65-.95 1.71-.82 2.74 1.01.08 2.06-.55 2.57-1.24z" />
              </svg>
              <span className="hidden sm:inline">Apple</span>
            </button>
          </div>

          {/* CONTINUE AS GUEST BUTTON */}
          <div className="mt-5 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 py-3 text-xs font-bold text-slate-800 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <ShoppingBag size={15} />
              <span>Belanja sebagai Tamu (Continue as Guest)</span>
            </button>
          </div>

          {/* LINK TO LOGIN */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Sudah memiliki akun?{" "}
            <Link to="/login" className="font-bold text-slate-950 underline hover:text-blue-600">
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>

      {/* OAUTH INFO & CONFIGURATION MODAL */}
      {activeInfoModal && (
        <div
          onClick={() => setActiveInfoModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl mx-2 border border-slate-100"
          >
            <button
              onClick={() => setActiveInfoModal(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white font-black text-base shadow-sm">
                <Info size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-950">{activeInfoModal.name}</h3>
                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  ⚠️ Status: Siap Dikonfigurasi
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              {activeInfoModal.description}
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 space-y-1.5">
              <p className="font-bold text-slate-900">Petunjuk Konfigurasi:</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                {activeInfoModal.requirement}
              </p>
            </div>

            <button
              onClick={() => setActiveInfoModal(null)}
              className="mt-6 w-full rounded-2xl bg-slate-950 py-3 text-xs font-bold text-white hover:bg-slate-800"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* INTERACTIVE SOCIAL SIGN IN MODAL */}
      <SocialLoginModal
        isOpen={!!activeSocialModal}
        provider={activeSocialModal}
        onClose={() => setActiveSocialModal(null)}
      />
    </div>
  );
}

export default Register;

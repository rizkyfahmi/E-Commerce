import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SocialLoginModal, { type SocialProviderData } from "../../components/SocialLoginModal";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  ShieldAlert,
  Phone,
  Mail,
  ShoppingBag,
  KeyRound,
  Fingerprint,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  // Mode: "PASSWORD" | "PHONE_OTP"
  const [loginMode, setLoginMode] = useState<"PASSWORD" | "PHONE_OTP">("PASSWORD");

  // Email / Password Form
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone + OTP Form
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // More Providers Collapsible
  const [showMoreProviders, setShowMoreProviders] = useState(false);

  // Provider Status & Modal
  const [activeInfoModal, setActiveInfoModal] = useState<{
    name: string;
    description: string;
    requirement: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP Cooldown Timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpCooldown]);

  // Submit Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError("Silakan masukkan email / nomor telepon dan kata sandi.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email / nomor telepon atau kata sandi tidak sesuai.");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Role Redirects
      if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Email / nomor telepon atau kata sandi tidak sesuai.");
    } finally {
      setLoading(false);
    }
  };

  // Send Phone OTP
  const handleSendOtp = async () => {
    if (!phone.trim() || phone.length < 8) {
      setError("Masukkan nomor telepon yang valid (contoh: 08123456789).");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setDevOtpHint(null);

      const res = await fetch("http://localhost:3000/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirimkan OTP.");

      setOtpSent(true);
      setOtpCooldown(data.cooldownSeconds || 60);
      if (data.devOtp) {
        setDevOtpHint(data.devOtp);
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengirim OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Phone + OTP Login
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !otp.trim()) {
      setError("Silakan masukkan nomor telepon dan 6 digit kode OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:3000/auth/otp/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kode OTP tidak valid atau kedaluwarsa.");

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Kode OTP tidak valid atau kedaluwarsa.");
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
    github: {
      id: "github",
      name: "GitHub",
      color: "#24292e",
      iconBg: "bg-slate-100",
      defaultEmail: "developer@github.com",
      defaultName: "GitHub Developer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      svg: (
        <svg className="h-5 w-5 fill-slate-900" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
    },
    microsoft: {
      id: "microsoft",
      name: "Microsoft",
      color: "#00a4ef",
      iconBg: "bg-slate-50",
      defaultEmail: "user.microsoft@outlook.com",
      defaultName: "Microsoft User",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      svg: (
        <svg className="h-5 w-5" viewBox="0 0 23 23">
          <path fill="#f35325" d="M1 1h10v10H1z" />
          <path fill="#81bc06" d="M12 1h10v10H12z" />
          <path fill="#05a6f0" d="M1 12h10v10H1z" />
          <path fill="#ffba08" d="M12 12h10v10H12z" />
        </svg>
      ),
    },
  };

  // Handle OAuth Provider Click
  const handleOAuthClick = async (providerId: string, providerName: string) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`http://localhost:3000/auth/oauth/${providerId}/url`);
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
            description: `Integrasi resmi ${providerName} Authentication telah siap di backend.`,
            requirement: `Untuk mengaktifkan login ${providerName} secara live, masukkan Client ID dan Secret ke file .env backend (${providerId.toUpperCase()}_CLIENT_ID dan ${providerId.toUpperCase()}_CLIENT_SECRET).`,
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

  // Passkey Sign In handler
  const handlePasskeyLogin = async () => {
    setActiveInfoModal({
      name: "Passkey / WebAuthn (FIDO2)",
      description: "Standar otentikasi biometrik modern (Fingerprint, Face ID, Windows Hello).",
      requirement: "Dukungan WebAuthn aktif dan siap digunakan pada domain HTTPS atau localhost browser modern yang mendukung FIDO2 credentials.",
    });
  };

  // Quick fill testing accounts
  const quickFill = (type: "admin" | "seller" | "customer") => {
    setLoginMode("PASSWORD");
    if (type === "admin") {
      setIdentifier("admin@eshop.com");
      setPassword("password123");
    } else if (type === "seller") {
      setIdentifier("seller@eshop.com");
      setPassword("password123");
    } else {
      setIdentifier("customer@eshop.com");
      setPassword("password123");
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

        {/* LOGIN CARD */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Masuk ke Akun
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
              Pilih metode login yang Anda inginkan untuk melanjutkan.
            </p>
          </div>

          {/* TESTING ACCOUNTS QUICK-FILL */}
          <div className="mt-5 rounded-2xl bg-slate-50 p-3 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Akun Testing (1-Klik Isi)
              </span>
              <span className="text-[10px] text-slate-400">Pass: password123</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => quickFill("admin")}
                className="rounded-xl bg-white px-2 py-1.5 text-[10px] font-bold text-slate-800 border border-slate-200 hover:bg-slate-900 hover:text-white transition truncate shadow-2xs"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => quickFill("seller")}
                className="rounded-xl bg-white px-2 py-1.5 text-[10px] font-bold text-slate-800 border border-slate-200 hover:bg-indigo-600 hover:text-white transition truncate shadow-2xs"
              >
                🏪 Seller
              </button>
              <button
                type="button"
                onClick={() => quickFill("customer")}
                className="rounded-xl bg-white px-2 py-1.5 text-[10px] font-bold text-slate-800 border border-slate-200 hover:bg-blue-600 hover:text-white transition truncate shadow-2xs"
              >
                🛒 Buyer
              </button>
            </div>
          </div>

          {/* MODE SELECTOR TABS */}
          <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setLoginMode("PASSWORD");
                setError("");
              }}
              className={`rounded-xl py-2 text-xs font-bold transition ${
                loginMode === "PASSWORD"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Email / Password
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode("PHONE_OTP");
                setError("");
              }}
              className={`rounded-xl py-2 text-xs font-bold transition ${
                loginMode === "PHONE_OTP"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Nomor Telepon + OTP
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: EMAIL / PHONE + PASSWORD */}
          {/* ========================================================================= */}
          {loginMode === "PASSWORD" && (
            <form onSubmit={handlePasswordLogin} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email atau Nomor Telepon
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="user@example.com atau 08123456789"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-slate-950 focus:bg-white"
                    required
                  />
                  <div className="absolute left-3.5 top-3.5 text-slate-400">
                    {identifier.includes("@") ? <Mail size={16} /> : <Phone size={16} />}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Kata Sandi
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-xs sm:text-sm outline-none transition focus:border-slate-950 focus:bg-white"
                    required
                  />
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                />
                <label htmlFor="rememberMe" className="ml-2 text-xs text-slate-600 font-medium">
                  Ingat saya di perangkat ini
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-950 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Masuk ke Akun"}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PHONE NUMBER + OTP FLOW */}
          {/* ========================================================================= */}
          {loginMode === "PHONE_OTP" && (
            <form onSubmit={handleOtpLogin} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nomor Telepon (WhatsApp / SMS)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08123456789"
                      disabled={otpSent && otpCooldown > 0}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-xs sm:text-sm outline-none transition focus:border-slate-950 focus:bg-white disabled:opacity-70"
                      required
                    />
                    <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || otpCooldown > 0}
                    className="rounded-2xl border border-slate-200 bg-slate-100 px-4 text-xs font-bold text-slate-800 transition hover:bg-slate-200 disabled:opacity-50 shrink-0"
                  >
                    {otpCooldown > 0 ? `${otpCooldown}s` : otpSent ? "Kirim Ulang" : "Kirim OTP"}
                  </button>
                </div>
              </div>

              {/* DEV OTP HINT */}
              {devOtpHint && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>Kode OTP Percobaan: <strong>{devOtpHint}</strong></span>
                </div>
              )}

              {otpSent && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Masukkan 6-Digit Kode OTP *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="Contoh: 123456"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-center font-mono text-base font-bold tracking-widest outline-none transition focus:border-slate-950 focus:bg-white"
                      required
                    />
                    <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    Kode kedaluwarsa dalam 5 menit.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !otpSent || otp.length < 6}
                className="w-full rounded-2xl bg-slate-950 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-40"
              >
                {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
              </button>
            </form>
          )}

          {/* SOCIAL LOGIN DIVIDER */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              atau masuk dengan
            </span>
          </div>

          {/* TOP 3 SOCIAL BUTTONS (GOOGLE, FACEBOOK, APPLE) */}
          <div className="grid grid-cols-3 gap-2">
            {/* GOOGLE BUTTON */}
            <button
              type="button"
              onClick={() => handleOAuthClick("google", "Google")}
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

            {/* FACEBOOK BUTTON */}
            <button
              type="button"
              onClick={() => handleOAuthClick("facebook", "Facebook")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-2.5 px-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
            >
              <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="hidden sm:inline">Facebook</span>
            </button>

            {/* APPLE BUTTON */}
            <button
              type="button"
              onClick={() => handleOAuthClick("apple", "Apple")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-2.5 px-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
            >
              <svg className="h-4 w-4 fill-black" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2.03.62-2.67 1.37-.56.65-.95 1.71-.82 2.74 1.01.08 2.06-.55 2.57-1.24z" />
              </svg>
              <span className="hidden sm:inline">Apple</span>
            </button>
          </div>

          {/* MORE WAYS TO SIGN IN (COLLAPSIBLE) */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowMoreProviders(!showMoreProviders)}
              className="flex w-full items-center justify-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition py-1"
            >
              <span>{showMoreProviders ? "Sembunyikan provider lain" : "More ways to sign in (Microsoft, GitHub, Passkey)"}</span>
              {showMoreProviders ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showMoreProviders && (
              <div className="mt-2 space-y-2 pt-1 animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  {/* MICROSOFT */}
                  <button
                    type="button"
                    onClick={() => handleOAuthClick("microsoft", "Microsoft")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    <span>Microsoft</span>
                  </button>

                  {/* GITHUB */}
                  <button
                    type="button"
                    onClick={() => handleOAuthClick("github", "GitHub")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <svg className="h-3.5 w-3.5 fill-black" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                {/* PASSKEY BUTTON */}
                <button
                  type="button"
                  onClick={handlePasskeyLogin}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  <Fingerprint size={16} className="text-indigo-600" />
                  <span>Sign in with Passkey (Biometrik / Touch ID / Face ID)</span>
                </button>
              </div>
            )}
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

          {/* LINK TO REGISTER */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Belum memiliki akun?{" "}
            <Link to="/register" className="font-bold text-slate-950 underline hover:text-blue-600">
              Daftar Sekarang
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

export default Login;

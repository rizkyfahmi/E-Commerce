import { API_BASE_URL } from "../../lib/config";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();

  // Step: 1 (Request OTP) | 2 (Verify OTP & Set New Password) | 3 (Success)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cooldown Timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Masukkan email atau nomor telepon Anda.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirimkan kode pemulihan.");

      setCooldown(data.cooldownSeconds || 60);
      if (data.devOtp) setDevOtpHint(data.devOtp);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim() || otp.length < 6) {
      setError("Masukkan 6-digit kode verifikasi.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak sesuai.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: identifier.trim(),
          code: otp.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui kata sandi.");

      setStep(3);
    } catch (err: any) {
      setError(err.message || "Kode verifikasi salah atau kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* TOP BRANDING & BACK */}
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Kembali ke Login
          </Link>

          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
              E
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-sm">E-Shop</span>
          </Link>
        </div>

        {/* CARD CONTAINER */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl">
          {/* STEP 1: REQUEST OTP */}
          {step === 1 && (
            <div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                  <KeyRound size={24} />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
                  Lupa Kata Sandi?
                </h1>
                <p className="mt-1.5 text-xs text-slate-500">
                  Masukkan email atau nomor telepon yang terdaftar pada akun Anda untuk menerima kode pemulihan.
                </p>
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-950 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading ? "Mengirimkan Kode..." : "Kirim Kode Pemulihan"}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: VERIFY OTP & RESET PASSWORD */}
          {step === 2 && (
            <div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
                  <Lock size={24} />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
                  Buat Kata Sandi Baru
                </h1>
                <p className="mt-1.5 text-xs text-slate-500">
                  Kode verifikasi telah dikirimkan ke <strong>{identifier}</strong>.
                </p>
              </div>

              {devOtpHint && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>Kode OTP Percobaan: <strong>{devOtpHint}</strong></span>
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    6-Digit Kode Verifikasi *
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
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Kata Sandi Baru (Min. 6 Karakter) *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan kata sandi baru"
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Konfirmasi Kata Sandi Baru *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-slate-950 focus:bg-white"
                      required
                    />
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-950 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-950">
                Kata Sandi Diperbarui!
              </h2>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Kata sandi akun Anda telah berhasil diperbarui. Untuk keamanan, semua sesi login lama telah dicabut.
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-6 w-full rounded-2xl bg-slate-950 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
              >
                Masuk ke Akun Sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

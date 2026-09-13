import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShoppingBag,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Email atau password salah.");
      }

      localStorage.setItem("token", data.access_token);

      const decoded = jwtDecode<{ role: string }>(data.access_token);

      console.log("TOKEN:", data.access_token);
      console.log("ROLE:", decoded.role);

      localStorage.setItem("role", decoded.role);

      if (decoded.role === "ADMIN") {
        console.log("LOGIN SEBAGAI ADMIN");
        window.location.href = "/admin";
      } else if (decoded.role === "SELLER") {
        console.log("LOGIN SEBAGAI SELLER");
        window.location.href = "/seller";
      } else if (decoded.role === "CUSTOMER") {
        console.log("LOGIN SEBAGAI CUSTOMER");
        window.location.href = "/";
      } else {
        console.log("ROLE TIDAK DIKENAL:", decoded.role);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Terjadi kesalahan saat login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </button>

        <div className="flex min-h-[calc(100vh-140px)] items-center justify-center">
          <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">

            {/* Left */}
            <div className="hidden bg-slate-950 p-12 text-white md:flex md:flex-col md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950">
                    <ShoppingBag size={22} />
                  </div>

                  <span className="text-xl font-bold">
                    E-Shop
                  </span>
                </div>

                <div className="mt-24">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                    Welcome Back
                  </p>

                  <h1 className="mt-5 text-5xl font-bold leading-tight">
                    Belanja lebih mudah,
                    <br />
                    mulai dari sini.
                  </h1>

                  <p className="mt-6 max-w-md leading-7 text-slate-400">
                    Masuk ke akun E-Shop kamu dan nikmati pengalaman
                    belanja produk teknologi dengan lebih nyaman.
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-500">
                © 2026 E-Shop
              </p>
            </div>

            {/* Right */}
            <div className="p-8 sm:p-12">
              <div className="mx-auto max-w-md">

                {/* Mobile Logo */}
                <div className="mb-8 flex items-center gap-3 md:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <ShoppingBag size={22} />
                  </div>

                  <span className="text-xl font-bold">
                    E-Shop
                  </span>
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Account
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight">
                  Selamat datang kembali
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Masuk menggunakan akun kamu untuk melanjutkan.
                </p>

                {/* Error */}
                {error && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleLogin}
                  className="mt-8 space-y-5"
                >
                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Email
                    </label>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-slate-950 focus-within:bg-white">
                      <Mail size={18} className="text-slate-400" />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Password
                    </label>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-slate-950 focus-within:bg-white">
                      <LockKeyhole
                        size={18}
                        className="text-slate-400"
                      />

                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        className="w-full bg-transparent text-sm outline-none"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="text-slate-400 transition hover:text-slate-900"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Login */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Memproses..." : "Login"}
                  </button>
                </form>

                {/* Register */}
                <p className="mt-8 text-center text-sm text-slate-500">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    className="font-bold text-slate-950 hover:underline"
                  >
                    Daftar sekarang
                  </button>
                </p>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
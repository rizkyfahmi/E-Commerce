import { API_BASE_URL } from "../lib/config";
import React, { useState } from "react";
import { X, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface SocialProviderData {
  id: "google" | "facebook" | "apple" | "microsoft" | "github";
  name: string;
  color: string;
  iconBg: string;
  svg: React.ReactNode;
  defaultEmail: string;
  defaultName: string;
  avatar: string;
}

export const defaultSocialProviders: Record<string, SocialProviderData> = {
  google: {
    id: "google",
    name: "Google",
    color: "#4285F4",
    iconBg: "bg-red-50 text-red-600",
    svg: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
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
    ),
    defaultEmail: "user.google@gmail.com",
    defaultName: "Google Account User",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
    iconBg: "bg-blue-50 text-blue-600",
    svg: (
      <svg className="w-5 h-5 fill-current text-[#1877F2]" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    defaultEmail: "user.facebook@meta.com",
    defaultName: "Facebook Account User",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
  },
  apple: {
    id: "apple",
    name: "Apple",
    color: "#000000",
    iconBg: "bg-slate-100 text-slate-900",
    svg: (
      <svg className="w-5 h-5 fill-current text-slate-900" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.12.64-2.79 1.43-.58.68-1.1 1.74-1.01 2.81 1.07.08 2.17-.62 2.79-1.37z" />
      </svg>
    ),
    defaultEmail: "user.apple@icloud.com",
    defaultName: "Apple ID User",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  },
  microsoft: {
    id: "microsoft",
    name: "Microsoft",
    color: "#00A4EF",
    iconBg: "bg-sky-50 text-sky-600",
    svg: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#f25022" d="M1 1h10v10H1z" />
        <path fill="#00a4ef" d="M1 13h10v10H1z" />
        <path fill="#7fba00" d="M13 1h10v10H13z" />
        <path fill="#ffb900" d="M13 13h10v10H13z" />
      </svg>
    ),
    defaultEmail: "user.microsoft@outlook.com",
    defaultName: "Microsoft Account User",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  },
  github: {
    id: "github",
    name: "GitHub",
    color: "#24292e",
    iconBg: "bg-slate-100 text-slate-900",
    svg: (
      <svg className="w-5 h-5 fill-current text-slate-900" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    defaultEmail: "developer@github.com",
    defaultName: "GitHub Developer",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
  },
};

interface SocialLoginModalProps {
  isOpen: boolean;
  provider: SocialProviderData | null;
  mode?: "signin" | "link";
  onClose: () => void;
  onSuccess?: (userOrData: any) => void;
}

export const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  isOpen,
  provider,
  mode = "signin",
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"SIGNIN" | "SETUP_GUIDE">("SIGNIN");

  const token = localStorage.getItem("token");

  if (!isOpen || !provider) return null;

  const handleAction = async (email: string, name: string) => {
    try {
      setLoading(true);
      setError("");

      const providerAccountId = `${provider.id}_${Math.floor(10000000 + Math.random() * 90000000)}`;

      if (mode === "link" && token) {
        // LINK TO CURRENT LOGGED-IN USER ACCOUNT
        const res = await fetch(`${API_BASE_URL}/auth/security/link`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            provider: provider.id.toUpperCase(),
            providerAccountId,
            providerEmail: email.trim().toLowerCase(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || `Gagal menghubungkan ${provider.name}`);
        }

        if (onSuccess) onSuccess(data);
        onClose();
      } else {
        // SOCIAL SIGN IN / GUEST LOGIN
        const res = await fetch(`${API_BASE_URL}/auth/social-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: provider.id.toUpperCase(),
            providerId: providerAccountId,
            email: email.trim().toLowerCase(),
            name: name.trim() || `${provider.name} User`,
            avatar: provider.avatar,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || `Gagal login dengan ${provider.name}`);
        }

        // Save token and user details
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (onSuccess) onSuccess(data.user);
        onClose();

        // Redirect based on role if signin
        if (mode === "signin") {
          if (data.user.role === "ADMIN") {
            navigate("/admin");
          } else if (data.user.role === "SELLER") {
            navigate("/seller");
          } else {
            navigate("/");
          }
        }
      }
    } catch (err: any) {
      console.error("Social auth error:", err);
      setError(err.message || `Gagal memproses dengan ${provider.name}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in scale-in"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X size={16} />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200">
            {provider.svg}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-950">
              {mode === "link" ? `Hubungkan Akun ${provider.name}` : `Masuk dengan ${provider.name}`}
            </h3>
            <p className="text-[11px] text-slate-400">
              {mode === "link"
                ? "Tautkan akun sosial untuk kemudahan login instan"
                : "Autentikasi Cepat & Aman 1-Klik"}
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="mt-5 flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab("SIGNIN")}
            className={`flex-1 rounded-lg py-2 transition ${
              activeTab === "SIGNIN" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            {mode === "link" ? "Hubungkan Akun" : "Pilih Akun Cepat"}
          </button>
          <button
            onClick={() => setActiveTab("SETUP_GUIDE")}
            className={`flex-1 rounded-lg py-2 transition ${
              activeTab === "SETUP_GUIDE" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            Info OAuth 2.0
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {activeTab === "SIGNIN" ? (
          <div className="mt-5 space-y-4">
            {/* INSTANT ACCOUNT SELECTOR */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pilih Akun {provider.name} Terdeteksi:
              </label>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleAction(provider.defaultEmail, provider.defaultName)}
                className="mt-2 w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3.5 hover:border-slate-400 hover:bg-slate-50/80 transition text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {provider.defaultName}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {provider.defaultEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                  <span>{mode === "link" ? "Tautkan" : "Pilih"}</span>
                  <ChevronRight size={14} />
                </div>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">
                Atau Gunakan Email Kustom
              </span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* CUSTOM EMAIL INPUT */}
            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Nama Akun Anda"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Email Akun {provider.name}</label>
                <input
                  type="email"
                  placeholder={`contoh@${provider.id}.com`}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-950"
                />
              </div>

              <button
                type="button"
                disabled={loading || !customEmail.trim()}
                onClick={() => handleAction(customEmail, customName || "Pengguna " + provider.name)}
                className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition"
              >
                {loading ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-400" />
                    <span>
                      {mode === "link"
                        ? `Hubungkan Akun ${provider.name}`
                        : `Lanjutkan Masuk dengan ${provider.name}`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3 text-xs text-slate-600">
            <div className="rounded-2xl bg-blue-50/60 p-4 border border-blue-100">
              <p className="font-bold text-blue-950 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-blue-600" />
                <span>Integrasi OAuth 2.0 Resmi</span>
              </p>
              <p className="mt-1 text-[11px] text-blue-800 leading-relaxed">
                Di lingkungan produksi, tombol ini terhubung langsung ke Google Cloud Console / Meta Developer OAuth Consent Screen dengan Client ID & Secret di backend (.env).
              </p>
            </div>

            <div className="space-y-1 text-[11px] text-slate-500">
              <p className="font-semibold text-slate-800">Kredensial Environment Backend:</p>
              <code className="block bg-slate-100 p-2 rounded-lg text-slate-800">
                GOOGLE_CLIENT_ID=xxx<br />
                GOOGLE_CLIENT_SECRET=xxx
              </code>
            </div>

            <button
              onClick={() => setActiveTab("SIGNIN")}
              className="mt-3 w-full rounded-xl border border-slate-200 py-2 font-bold text-slate-700 hover:bg-slate-50"
            >
              Kembali ke Pemilihan Akun
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialLoginModal;

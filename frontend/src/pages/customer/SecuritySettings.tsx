import { API_BASE_URL } from "../../lib/config";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  Laptop,
  Key,
  LogOut,
  Trash2,
  History,
  Copy,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import SocialLoginModal, {
  defaultSocialProviders,
} from "../../components/SocialLoginModal";
import type { SocialProviderData } from "../../components/SocialLoginModal";
import ConfirmModal from "../../components/ConfirmModal";
import { isGuestUser } from "../../lib/auth";

interface LoginMethodsData {
  email: { value: string | null; isVerified: boolean; hasPassword: boolean };
  phone: { value: string | null; isVerified: boolean };
  twoFactorEnabled: boolean;
  linkedProviders: Array<{
    id: string;
    provider: string;
    accountId: string;
    email?: string;
    createdAt: string;
  }>;
  passkeyActive: boolean;
}

interface UserSessionItem {
  id: string;
  browser: string;
  os: string;
  device: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

interface ActivityItem {
  id: string;
  action: string;
  location: string;
  device: string;
  ipAddress: string;
  createdAt: string;
}

function SecuritySettings() {
  const token = localStorage.getItem("token");
  const isGuest = isGuestUser();

  const [methods, setMethods] = useState<LoginMethodsData | null>(null);
  const [sessions, setSessions] = useState<UserSessionItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Social Connect Modal State
  const [activeSocialModal, setActiveSocialModal] = useState<{
    provider: SocialProviderData;
    mode: "signin" | "link";
  } | null>(null);

  // Confirm Modal State
  const [confirmModalData, setConfirmModalData] = useState<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState("");

  // 2FA Setup State
  const [twoFactorModal, setTwoFactorModal] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    secret: string;
    otpauthUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [verify2faCode, setVerify2faCode] = useState("");
  const [disable2faPassword, setDisable2faPassword] = useState("");
  const [disable2faModal, setDisable2faModal] = useState(false);

  const [copiedSecret, setCopiedSecret] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Load All Security Data
  const loadSecurityData = async () => {
    if (isGuest || !token) {
      return;
    }

    try {
      const [resMethods, resSessions, resActivities] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/security/methods`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/auth/security/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/auth/security/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (resMethods.ok) setMethods(await resMethods.json());
      if (resSessions.ok) setSessions(await resSessions.json());
      if (resActivities.ok) setActivities(await resActivities.json());
    } catch (err) {
      console.error("Security data fetch error:", err);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, [token]);

  // Open Social Connect Modal
  const openSocialConnect = (providerKey: string) => {
    const prov = defaultSocialProviders[providerKey.toLowerCase()];
    if (!prov) return;
    setActiveSocialModal({
      provider: prov,
      mode: isGuest ? "signin" : "link",
    });
  };

  // Revoke Session
  const handleRevokeSession = (sessionId: string) => {
    setConfirmModalData({
      title: "Cabut Sesi Perangkat",
      message: "Apakah Anda yakin ingin mencabut sesi login perangkat ini?",
      confirmText: "Ya, Cabut Sesi",
      onConfirm: async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/auth/security/sessions/${sessionId}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.ok) {
            showToast("Sesi perangkat berhasil dicabut.");
            loadSecurityData();
          }
        } catch (err) {
          showToast("Gagal mencabut sesi perangkat.");
        } finally {
          setConfirmModalData(null);
        }
      },
    });
  };

  // Logout All Devices
  const handleLogoutAllDevices = () => {
    setConfirmModalData({
      title: "Keluar Dari Semua Perangkat",
      message:
        "Apakah Anda yakin ingin keluar dari semua perangkat aktif? Anda harus login kembali.",
      confirmText: "Ya, Keluar Semua",
      onConfirm: async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/auth/security/sessions/logout-all`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.ok) {
            showToast("Semua sesi perangkat telah dicabut.");
            loadSecurityData();
          }
        } catch (err) {
          showToast("Gagal mencabut semua sesi.");
        } finally {
          setConfirmModalData(null);
        }
      },
    });
  };

  // Unlink Provider
  const handleUnlinkProvider = (provider: string) => {
    setConfirmModalData({
      title: `Lepas Akun ${provider}`,
      message: `Apakah Anda yakin ingin memutuskan hubungan akun ${provider}? Pastikan Anda masih memiliki metode login lain untuk masuk ke akun ini.`,
      confirmText: "Ya, Putuskan",
      onConfirm: async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/auth/security/unlink/${provider}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Gagal melepas provider.");
          showToast(`Akun ${provider} berhasil dilepas.`);
          loadSecurityData();
        } catch (err: any) {
          showToast(err.message || "Gagal melepas provider.");
        } finally {
          setConfirmModalData(null);
        }
      },
    });
  };

  // Start 2FA Setup
  const handleStart2FASetup = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/security/2fa/setup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactorData(data);
        setTwoFactorModal(true);
      }
    } catch (err) {
      showToast("Gagal memulai setup 2FA.");
    }
  };

  // Confirm Enable 2FA
  const handleConfirmEnable2FA = async () => {
    if (!verify2faCode.trim()) {
      showToast("Masukkan kode verifikasi 6 digit.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/security/2fa/enable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: verify2faCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kode 2FA salah.");
      showToast("Two-Factor Authentication berhasil diaktifkan!");
      setTwoFactorModal(false);
      loadSecurityData();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/security/2fa/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: disable2faPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menonaktifkan 2FA.");
      showToast("2FA berhasil dinonaktifkan.");
      setDisable2faModal(false);
      setDisable2faPassword("");
      loadSecurityData();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* HEADER NAV */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Kembali ke Marketplace
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white">
              E
            </div>
            <span className="text-sm font-bold text-slate-900">E-Shop Security Hub</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* TOAST MESSAGE */}
        {toastMessage && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm font-bold text-emerald-800 shadow-sm animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* HERO TITLE */}
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 mb-2">
            <ShieldCheck size={13} className="text-emerald-600" />
            Pusat Keamanan & Integrasi Akun
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Keamanan & Privasi Akun
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Kelola metode login, integrasikan akun Google & sosial media, amankan dengan 2FA, dan pantau sesi perangkat aktif.
          </p>
        </div>

        {/* ===================================================================== */}
        {/* GUEST MODE HERO BANNER */}
        {/* ===================================================================== */}
        {isGuest && (
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 text-indigo-800 px-3 py-1 text-xs font-bold">
                  <Sparkles size={14} className="text-indigo-600" />
                  Mode Akun Tamu (Guest)
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                  Hubungkan Akun Google / Media Sosial Anda
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                  Tautkan akun Google, Facebook, atau Apple Anda dengan 1-klik untuk menyimpan keranjang belanja, rincian transaksi, dan mengamankan akun secara permanen.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openSocialConnect("google")}
                  className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm hover:shadow hover:border-slate-300 transition cursor-pointer"
                >
                  {defaultSocialProviders.google.svg}
                  <span>Hubungkan Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => openSocialConnect("facebook")}
                  className="flex items-center gap-2 rounded-2xl bg-[#1877F2] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#166fe5] transition cursor-pointer"
                >
                  {defaultSocialProviders.facebook.svg}
                  <span>Hubungkan Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => openSocialConnect("apple")}
                  className="flex items-center gap-2 rounded-2xl bg-black px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                >
                  {defaultSocialProviders.apple.svg}
                  <span>Hubungkan Apple</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SECTION 1: LOGIN METHODS & SOCIAL ACCOUNT LINKING */}
        {/* ===================================================================== */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Key size={20} className="text-slate-900" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-950">
                  Integrasi Akun & Media Sosial
                </h2>
                <p className="text-xs text-slate-500">
                  Hubungkan akun Google, Facebook, Apple, atau GitHub untuk masuk dengan sekali klik tanpa perlu mengingat kata sandi.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {/* SOCIAL PROVIDERS LIST */}
            {["google", "facebook", "apple", "microsoft", "github"].map((provKey) => {
              const provConfig = defaultSocialProviders[provKey];
              if (!provConfig) return null;

              const linked = methods?.linkedProviders.find(
                (p) => p.provider.toUpperCase() === provConfig.name.toUpperCase(),
              );

              return (
                <div
                  key={provKey}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                      {provConfig.svg}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {provConfig.name}
                        </span>
                        {linked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} /> Terhubung (Connected)
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                            Belum Terhubung
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {linked
                          ? `Terhubung sejak ${new Date(linked.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} • ${linked.email || "Email akun tertaut"}`
                          : `Gunakan akun ${provConfig.name} untuk autentikasi instan 1-klik.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {linked ? (
                      <button
                        type="button"
                        onClick={() => handleUnlinkProvider(provConfig.name.toUpperCase())}
                        className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                      >
                        Putuskan Akun
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openSocialConnect(provKey)}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Zap size={13} className="text-amber-400 fill-amber-400" />
                        <span>Hubungkan {provConfig.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* EMAIL ACCOUNT */}
            {!isGuest && (
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">Alamat Email</span>
                    {methods?.email.isVerified ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        Belum Terverifikasi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {methods?.email.value || "Belum ditambahkan"}
                  </p>
                </div>
                <Link
                  to="/forgot-password"
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
                >
                  Ubah Kata Sandi
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SECTION 2: TWO-FACTOR AUTHENTICATION (2FA) */}
        {/* ===================================================================== */}
        {!isGuest && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Smartphone size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-950">
                      Otentikasi Dua Faktor (2FA)
                    </h2>
                    {methods?.twoFactorEnabled ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        Aktif
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-lg">
                    Tambahkan lapisan perlindungan ekstra ke akun Anda menggunakan aplikasi authenticator (Google Authenticator, Authy).
                  </p>
                </div>
              </div>

              {methods?.twoFactorEnabled ? (
                <button
                  type="button"
                  onClick={() => setDisable2faModal(true)}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition self-start sm:self-auto"
                >
                  Nonaktifkan 2FA
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStart2FASetup}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition self-start sm:self-auto"
                >
                  Aktifkan 2FA
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SECTION 3: ACTIVE SESSIONS */}
        {/* ===================================================================== */}
        {!isGuest && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Laptop size={20} className="text-slate-900" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-950">
                    Sesi Perangkat Aktif
                  </h2>
                  <p className="text-xs text-slate-500">
                    Perangkat yang saat ini sedang login ke akun Anda.
                  </p>
                </div>
              </div>

              {sessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleLogoutAllDevices}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                >
                  <LogOut size={13} />
                  <span>Logout Semua</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="py-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Laptop size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {sess.browser || "Browser"} di {sess.os || "OS"}
                        </span>
                        {sess.isCurrent && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            Perangkat Ini
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        IP: {sess.ipAddress || "127.0.0.1"} • Aktif:{" "}
                        {new Date(sess.lastActive).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition"
                      title="Cabut sesi ini"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SECTION 4: SECURITY AUDIT LOG */}
        {/* ===================================================================== */}
        {!isGuest && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <History size={20} className="text-slate-900" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-950">
                  Riwayat Aktivitas Keamanan
                </h2>
                <p className="text-xs text-slate-500">
                  Catatan aktivitas login, perubahan kata sandi, dan integrasi akun sosial.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {activities.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">
                  Belum ada catatan aktivitas keamanan.
                </p>
              ) : (
                activities.slice(0, 5).map((act) => (
                  <div
                    key={act.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{act.action}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {act.location || "Indonesia"} • IP: {act.ipAddress || "127.0.0.1"}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(act.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* SOCIAL LOGIN / CONNECT MODAL */}
      {/* ===================================================================== */}
      {activeSocialModal && (
        <SocialLoginModal
          isOpen={!!activeSocialModal}
          provider={activeSocialModal.provider}
          mode={activeSocialModal.mode}
          onClose={() => setActiveSocialModal(null)}
          onSuccess={() => {
            showToast(
              isGuest
                ? `Berhasil login dengan ${activeSocialModal.provider.name}!`
                : `Akun ${activeSocialModal.provider.name} berhasil dihubungkan!`,
            );
            loadSecurityData();
          }}
        />
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModalData && (
        <ConfirmModal
          isOpen={!!confirmModalData}
          title={confirmModalData.title}
          message={confirmModalData.message}
          confirmText={confirmModalData.confirmText}
          cancelText="Batal"
          confirmVariant="danger"
          onConfirm={confirmModalData.onConfirm}
          onCancel={() => setConfirmModalData(null)}
        />
      )}

      {/* 2FA SETUP MODAL */}
      {twoFactorModal && twoFactorData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-950">Setup Otentikasi 2FA</h3>
            <p className="mt-1 text-xs text-slate-500">
              Pindai kode QR atau salin kunci rahasia ke aplikasi Authenticator Anda.
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs">
              <p className="font-bold text-slate-700">Kunci Rahasia Base32:</p>
              <div className="mt-1 flex items-center justify-between gap-2 font-mono bg-white p-2 rounded-xl border border-slate-200">
                <span className="truncate">{twoFactorData.secret}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(twoFactorData.secret);
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                  }}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {copiedSecret ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-700">
                Masukkan Kode 6-Digit dari Aplikasi:
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={verify2faCode}
                onChange={(e) => setVerify2faCode(e.target.value)}
                className="mt-1 w-full text-center tracking-widest text-lg font-mono rounded-xl border border-slate-200 py-2.5 font-bold outline-none focus:border-slate-950"
              />
            </div>

            <div className="mt-6 flex gap-2.5">
              <button
                type="button"
                onClick={() => setTwoFactorModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmEnable2FA}
                className="flex-1 rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm"
              >
                Verifikasi & Aktifkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISABLE 2FA MODAL */}
      {disable2faModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-950">Nonaktifkan 2FA</h3>
            <p className="mt-1 text-xs text-slate-500">
              Konfirmasi password Anda untuk menonaktifkan Otentikasi Dua Faktor.
            </p>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-700">Kata Sandi Anda:</label>
              <input
                type="password"
                placeholder="Masukkan kata sandi"
                value={disable2faPassword}
                onChange={(e) => setDisable2faPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-slate-950"
              />
            </div>

            <div className="mt-6 flex gap-2.5">
              <button
                type="button"
                onClick={() => setDisable2faModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDisable2FA}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
              >
                Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecuritySettings;

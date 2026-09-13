import { useEffect, useState } from "react";
import SellerLayout from "../../components/seller/SellerLayout";
import { User, Store, Mail, Calendar, Save, CheckCircle } from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

function SellerProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil profil seller");
      }

      const data = await response.json();
      setProfile(data);
      setFullName(data.fullName || "");
      setUsername(data.username || "");
      setEmail(data.email || "");
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");

    if (!fullName.trim() || !username.trim() || !email.trim()) {
      alert("Seluruh kolom profil wajib diisi!");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("http://localhost:3000/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          username,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal memperbarui profil");
        return;
      }

      setProfile(data);
      setSuccessMsg("Informasi toko dan profil berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (error) {
      console.error("Update profile error:", error);
      alert("Terjadi kesalahan saat menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerLayout
      title="Profil & Informasi Toko"
      subtitle="Kelola nama toko, identitas penjual, dan kontak akun Anda"
    >
      <div className="max-w-2xl">
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800">
            <CheckCircle size={20} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* AVATAR & HEADER */}
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-md">
              <Store size={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {loading ? "Memuat..." : profile?.fullName || "Nama Toko"}
              </h2>
              <p className="text-xs text-slate-400">
                @{profile?.username} • Mitra Penjual Resmi
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* NAMA TOKO / SELLER */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-700">
                <Store size={14} className="text-indigo-600" />
                Nama Toko / Nama Lengkap Penjual *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            {/* USERNAME */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-700">
                <User size={14} className="text-indigo-600" />
                Username Toko *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-700">
                <Mail size={14} className="text-indigo-600" />
                Alamat Email Kontak *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>

            {/* TANGGAL BERGABUNG */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-500">
                <Calendar size={14} />
                Tanggal Bergabung
              </label>
              <input
                type="text"
                disabled
                value={
                  profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <Save size={16} />
                <span>{saving ? "Menyimpan..." : "Simpan Profil Toko"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </SellerLayout>
  );
}

export default SellerProfile;

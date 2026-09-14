import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Save, CheckCircle, Percent, Mail, Globe } from "lucide-react";

interface PlatformSettings {
  siteName: string;
  commissionRate: number;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
}

function Settings() {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: "E-Shop Marketplace",
    commissionRate: 0.1,
    supportEmail: "admin@eshop.com",
    supportPhone: "+62 812-3456-7890",
    maintenanceMode: false,
  });

  const [, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const token = localStorage.getItem("token");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil pengaturan");
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Settings error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);

      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan pengaturan");
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (error) {
      console.error("Save settings error:", error);
      if (error instanceof Error) alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Pengaturan Platform"
      subtitle="Konfigurasi sistem marketplace, besaran komisi admin, dan kontak dukungan"
    >
      <div className="max-w-4xl space-y-6">
        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800">
            <CheckCircle size={18} className="text-emerald-600" />
            Pengaturan platform berhasil disimpan dan diperbarui!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GENERAL MARKETPLACE CONFIG */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Identitas Marketplace
                </h3>
                <p className="text-xs text-slate-400">
                  Nama brand platform dan operasional web
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Nama Platform / Website
                </label>
                <input
                  type="text"
                  required
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Mode Pemeliharaan (Maintenance)
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="maintenance"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maintenanceMode: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <label
                    htmlFor="maintenance"
                    className="text-xs font-medium text-slate-700"
                  >
                    Aktifkan Maintenance Mode (Toko offline sementara)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* FINANCIAL & COMMISSION CONFIG */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Percent size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Skema Komisi Admin Platform
                </h3>
                <p className="text-xs text-slate-400">
                  Persentase bagi hasil dari transaksi sukses (Completed)
                </p>
              </div>
            </div>

            <div className="mt-6 max-w-md">
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Persentase Komisi Platform (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={settings.commissionRate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      commissionRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-500 pr-10"
                />
                <span className="absolute right-3.5 top-2.5 text-sm font-bold text-slate-400">
                  %
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Saat ini: <strong className="text-emerald-600 font-bold">{settings.commissionRate}%</strong> dipotong otomatis dari setiap pesanan berstatus COMPLETED.
              </p>
            </div>
          </div>

          {/* CONTACT & SUPPORT */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Kontak Layanan & Support
                </h3>
                <p className="text-xs text-slate-400">
                  Informasi kontak yang dapat dihubungi oleh seller dan pembeli
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Email Dukungan
                </label>
                <input
                  type="email"
                  required
                  value={settings.supportEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, supportEmail: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Nomor WhatsApp / Hotline
                </label>
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, supportPhone: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default Settings;

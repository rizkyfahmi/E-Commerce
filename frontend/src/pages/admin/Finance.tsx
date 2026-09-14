import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { DollarSign, TrendingUp, Clock, CheckCircle2, ShieldCheck } from "lucide-react";

interface CommissionHistory {
  orderId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  sellerName: string;
  orderTotal: number;
  commissionEarned: number;
}

interface FinanceData {
  totalGMV: number;
  totalAdminCommission: number;
  totalInEscrow: number;
  commissionRate: number;
  completedOrdersCount: number;
  commissionHistory: CommissionHistory[];
}

function Finance() {
  const [finance, setFinance] = useState<FinanceData>({
    totalGMV: 0,
    totalAdminCommission: 0,
    totalInEscrow: 0,
    commissionRate: 0.1,
    completedOrdersCount: 0,
    commissionHistory: [],
  });

  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/finance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data keuangan");
      }

      const data = await response.json();
      setFinance(data);
    } catch (error) {
      console.error("Finance error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AdminLayout
      title="Keuangan & Dompet Admin"
      subtitle="Monitoring arus kas marketplace, saldo komisi platform 0.1%, dan dana escrow pesanan"
    >
      {/* FINANCIAL METRICS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* DOMPET / SALDO KOMISI ADMIN */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Dompet Admin (Saldo Bersih)
            </span>
            <div className="rounded-xl bg-slate-800 p-2 text-emerald-400">
              <DollarSign size={20} />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-black text-white">
            {loading ? "..." : formatPrice(finance.totalAdminCommission)}
          </h2>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <TrendingUp size={14} /> Fee {finance.commissionRate}% dari pesanan Completed
          </div>
        </div>

        {/* TOTAL GMV TRANSAKSI */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total GMV Selesai
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : formatPrice(finance.totalGMV)}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Dari {finance.completedOrdersCount} transaksi sukses
          </p>
        </div>

        {/* DANA ESCROW / PROSES PENGIRIMAN */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Dana Tertahan (Escrow)
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Clock size={20} />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : formatPrice(finance.totalInEscrow)}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Pesanan berstatus Paid & Shipped
          </p>
        </div>
      </div>

      {/* AUDIT LOG KOMISI PER PESANAN */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Riwayat Pembagian Komisi Transaksi Selesai
            </h3>
            <p className="text-xs text-slate-400">
              Setiap pesanan berstatus COMPLETED otomatis mencairkan komisi {finance.commissionRate}% ke Dompet Admin
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <ShieldCheck size={16} /> Otomatis & Terverifikasi
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Pembeli</th>
                <th className="px-6 py-4 font-semibold">Toko Penjual</th>
                <th className="px-6 py-4 font-semibold">Total Nilai Order</th>
                <th className="px-6 py-4 font-semibold text-emerald-600">Komisi Admin ({finance.commissionRate}%)</th>
                <th className="px-6 py-4 font-semibold">Tanggal Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Memuat data komisi...
                  </td>
                </tr>
              ) : finance.commissionHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Belum ada komisi dari pesanan yang selesai (COMPLETED).
                  </td>
                </tr>
              ) : (
                finance.commissionHistory.map((item) => (
                  <tr key={item.orderId} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-600">
                      #{item.orderId.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {item.customerName || "Pelanggan"}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-indigo-600">
                      {item.sellerName}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatPrice(item.orderTotal)}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-600">
                      +{formatPrice(item.commissionEarned)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(item.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Finance;

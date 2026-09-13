import { useEffect, useState } from "react";
import SellerLayout from "../../components/seller/SellerLayout";
import { TrendingUp, ShoppingBag, Boxes, Award, Package } from "lucide-react";

interface TopProduct {
  id: string;
  name: string;
  image?: string;
  unitsSold: number;
  revenue: number;
}

interface Summary {
  totalOrders: number;
  totalSales: number;
  totalUnitsSold: number;
  topProducts: TopProduct[];
}

function SellerSales() {
  const [summary, setSummary] = useState<Summary>({
    totalOrders: 0,
    totalSales: 0,
    totalUnitsSold: 0,
    topProducts: [],
  });

  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3000/order/seller/summary",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data penjualan");
      }

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Seller sales error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <SellerLayout
      title="Laporan Penjualan"
      subtitle="Analisis omzet, unit barang terjual, dan performa produk terbaik toko Anda"
    >
      {/* STATS CARDS */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* TOTAL PENJUALAN */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Pendapatan
            </span>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : formatPrice(summary.totalSales)}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Akumulasi transaksi penjualan toko
          </p>
        </div>

        {/* TOTAL PESANAN */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Pesanan
            </span>
            <ShoppingBag size={20} className="text-purple-500" />
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : summary.totalOrders}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Jumlah pesanan yang masuk ke toko
          </p>
        </div>

        {/* UNIT TERJUAL */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Barang Terjual
            </span>
            <Boxes size={20} className="text-indigo-500" />
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : summary.totalUnitsSold}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Total kuantitas unit produk terjual
          </p>
        </div>
      </div>

      {/* TOP SELLING PRODUCTS TABLE */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Peringkat Produk Terlaris
              </h2>
              <p className="text-xs text-slate-400">
                Produk toko dengan kontribusi penjualan tertinggi
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Ranking</th>
                <th className="px-6 py-4 font-semibold">Produk</th>
                <th className="px-6 py-4 font-semibold">Kuantitas Terjual</th>
                <th className="px-6 py-4 font-semibold text-right">
                  Total Omzet Produk
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Memuat data penjualan...
                  </td>
                </tr>
              ) : summary.topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Belum ada produk yang terjual.
                  </td>
                </tr>
              ) : (
                summary.topProducts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-xs font-extrabold text-slate-800">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <Package size={18} />
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {p.unitsSold} unit
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 text-right">
                      {formatPrice(p.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SellerLayout>
  );
}

export default SellerSales;
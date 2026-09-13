import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Store, Package, Mail, Calendar, Search } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: Category;
}

interface Seller {
  id: string;
  fullName: string;
  username: string;
  email: string;
  createdAt: string;
  products: Product[];
  _count?: {
    products: number;
  };
}

function Sellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/admin/sellers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data sellers");
      }

      const data = await response.json();
      setSellers(data);
    } catch (error) {
      console.error("Sellers error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredSellers = sellers.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout
      title="Sellers Management"
      subtitle="Daftar seluruh mitra penjual (toko) yang terdaftar dan berjualan di marketplace"
    >
      {/* SEARCH BAR */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 max-w-md">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama toko, username, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Toko Mitra:{" "}
          <span className="text-slate-900 font-bold">
            {filteredSellers.length} Toko
          </span>
        </div>
      </div>

      {/* SELLERS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            Memuat daftar toko...
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            Tidak ada toko mitra yang ditemukan.
          </div>
        ) : (
          filteredSellers.map((seller) => (
            <div
              key={seller.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition"
            >
              <div>
                {/* STORE IDENTITY */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-bold">
                    <Store size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-slate-900 truncate">
                      {seller.fullName}
                    </h3>
                    <p className="text-xs text-slate-400">@{seller.username}</p>
                  </div>
                </div>

                {/* STORE CONTACT & STATS */}
                <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{seller.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-900">
                      {seller._count?.products || seller.products?.length || 0}{" "}
                      Produk Aktif
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span>
                      Bergabung sejak{" "}
                      {new Date(seller.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* PRODUCT PREVIEWS */}
                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Katalog Produk Unggulan
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {seller.products.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs"
                      >
                        <span className="truncate font-medium text-slate-800">
                          {p.name}
                        </span>
                        <span className="shrink-0 font-bold text-slate-900">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    ))}
                    {seller.products.length === 0 && (
                      <p className="text-xs text-slate-400 py-1">
                        Belum ada produk terdaftar.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}

export default Sellers;

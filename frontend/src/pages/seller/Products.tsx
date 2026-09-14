import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import SellerLayout from "../../components/seller/SellerLayout";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  Boxes,
  Tag,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  category?: {
    id: string;
    name: string;
  };
  categoryId?: string;
  createdAt: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  image: string;
  categoryId: string;
}

function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    categoryId: "",
  });

  const token = localStorage.getItem("token");

  // =========================
  // GET PRODUK SELLER
  // =========================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/product/my-product`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil produk");
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Product error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET CATEGORY
  // =========================
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/category`);
      if (!response.ok) {
        throw new Error("Gagal mengambil kategori");
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Category error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      image: "",
      categoryId: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // TAMBAH / EDIT PRODUK
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.price || !form.stock) {
      alert("Nama produk, harga, dan stok wajib diisi!");
      return;
    }

    try {
      let response;

      if (editingId) {
        // EDIT
        response = await fetch(
          `${API_BASE_URL}/product/${editingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: form.name,
              description: form.description,
              price: Number(form.price),
              stock: Number(form.stock),
              image: form.image || undefined,
              categoryId: form.categoryId || undefined,
            }),
          },
        );
      } else {
        // TAMBAH
        response = await fetch(`${API_BASE_URL}/product`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            price: Number(form.price),
            stock: Number(form.stock),
            image: form.image || undefined,
            categoryId: form.categoryId || undefined,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message
            ? Array.isArray(data.message)
              ? data.message.join("\n")
              : data.message
            : "Gagal menyimpan produk",
        );
        return;
      }

      alert(
        editingId
          ? "Produk berhasil diperbarui"
          : "Produk berhasil ditambahkan ke toko",
      );

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Submit product error:", error);
      alert("Terjadi kesalahan saat menyimpan produk");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      image: product.image || "",
      categoryId: product.categoryId || product.category?.id || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId: string) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus produk ini dari toko Anda? Tindakan ini tidak dapat dibatalkan.",
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menghapus produk");
        return;
      }

      alert("Produk berhasil dihapus");
      fetchProducts();
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Terjadi kesalahan saat menghapus produk");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // FILTERED & SORTED PRODUCTS
  const filteredProducts = products
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory
        ? p.categoryId === selectedCategory || p.category?.id === selectedCategory
        : true;
      const matchStock =
        stockFilter === "ready"
          ? p.stock > 0
          : stockFilter === "empty"
          ? p.stock === 0
          : true;

      return matchSearch && matchCategory && matchStock;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "stock_desc") return b.stock - a.stock;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <SellerLayout
      title="Produk Saya"
      subtitle="Kelola katalog produk, harga, stok, dan kategori barang jualan toko Anda"
    >
      {/* TOP ACTIONS & FORM MODAL / PANEL */}
      {showForm && (
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-lg transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? "Edit Produk Toko" : "Tambah Produk Baru"}
              </h2>
              <p className="text-xs text-slate-400">
                Lengkapi informasi produk yang akan dijual
              </p>
            </div>
            <button
              onClick={resetForm}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Laptop Asus ZenBook 14"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Kategori Produk *
                  </label>
                  <a
                    href="/support"
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    + Request Kategori ke Admin
                  </a>
                </div>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  Kategori disediakan oleh Admin. Jika belum ada, gunakan menu Request Kategori.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Harga Satuan (Rp) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Contoh: 15000000"
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Jumlah Stok Barang *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Contoh: 25"
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                URL Foto Produk
              </label>
              <input
                type="text"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Deskripsi Produk
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Jelaskan spesifikasi dan keunggulan produk Anda..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                {editingId ? "Simpan Perubahan" : "Tambah Produk"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* SEARCH */}
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama produk di toko Anda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* CATEGORY FILTER */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* STOCK FILTER */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Stok:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="">Semua Stok</option>
              <option value="ready">Tersedia (&gt; 0)</option>
              <option value="empty">Habis (0)</option>
            </select>
          </div>

          {/* SORT FILTER */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="newest">Terbaru</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="stock_desc">Stok Terbanyak</option>
            </select>
          </div>

          {!showForm && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Plus size={16} />
              <span>Tambah Produk</span>
            </button>
          )}
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar Produk Toko
            </h2>
            <p className="text-xs text-slate-400">
              Menampilkan {filteredProducts.length} dari {products.length} total produk
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Produk</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">Harga Satuan</th>
                <th className="px-6 py-4 font-semibold">Stok</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Memuat katalog produk...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada produk yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-11 w-11 rounded-xl object-cover border border-slate-100"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <Package size={18} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-400 max-w-xs truncate">
                            {p.description || "Tidak ada deskripsi"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <Tag size={12} />
                        {p.category?.name || "Umum"}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      {formatPrice(p.price)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          p.stock > 10
                            ? "bg-emerald-50 text-emerald-700"
                            : p.stock > 0
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        <Boxes size={12} />
                        {p.stock} unit
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        title="Edit Produk"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Hapus Produk"
                      >
                        <Trash2 size={16} />
                      </button>
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

export default SellerProducts;
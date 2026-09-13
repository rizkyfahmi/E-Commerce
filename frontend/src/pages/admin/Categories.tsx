import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";
import { getCategoryIcon } from "../../components/CategorySection";

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/category?includeInactive=true");

      if (!response.ok) {
        throw new Error("Gagal mengambil kategori");
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Category error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama kategori wajib diisi");
      return;
    }

    try {
      setSubmitting(true);
      const url = editingId
        ? `http://localhost:3000/category/${editingId}`
        : "http://localhost:3000/category";

      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan kategori");
      }

      alert(editingId ? "Kategori berhasil diperbarui" : "Kategori baru berhasil ditambahkan");

      setName("");
      setDescription("");
      setIcon("");
      setIsActive(true);
      setEditingId(null);
      setShowForm(false);

      fetchCategories();
    } catch (error: any) {
      console.error("Save category error:", error);
      alert(error.message || "Terjadi kesalahan saat menyimpan kategori");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const response = await fetch(`http://localhost:3000/category/${cat.id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengubah status kategori");
      }

      fetchCategories();
    } catch (err: any) {
      console.error("Toggle error:", err);
      alert(err.message || "Gagal mengubah status");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setIcon(category.icon || "");
    setIsActive(category.isActive);
    setShowForm(true);
  };

  const handleDelete = async (id: string, productCount = 0) => {
    const message =
      productCount > 0
        ? `Kategori ini memiliki ${productCount} produk. Kategori akan dinonaktifkan agar tidak merusak data produk. Lanjutkan?`
        : "Yakin ingin menghapus kategori ini secara permanen?";

    if (!window.confirm(message)) return;

    try {
      const response = await fetch(`http://localhost:3000/category/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus kategori");
      }

      alert("Kategori berhasil diproses");
      fetchCategories();
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(error.message || "Gagal menghapus kategori");
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setIcon("");
    setIsActive(true);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase().trim()),
  );

  const activeCount = categories.filter((c) => c.isActive).length;

  return (
    <AdminLayout
      title="Kelola Kategori Produk"
      subtitle="Katalog kategori terpusat untuk marketplace E-Shop"
    >
      <div className="space-y-6">
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500">
              <Layers size={20} className="text-slate-900" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Kategori</span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">{categories.length}</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle2 size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Kategori Aktif
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">{activeCount}</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-400">
              <XCircle size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Nonaktif
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">
              {categories.length - activeCount}
            </p>
          </div>
        </div>

        {/* CONTROLS HEADER */}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={17} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama kategori..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-slate-950 focus:bg-white"
            />
          </div>

          <button
            onClick={() => {
              if (showForm) {
                handleCancel();
              } else {
                setShowForm(true);
              }
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={16} />
            <span>Tambah Kategori Baru</span>
          </button>
        </div>

        {/* ADD / EDIT FORM MODAL / DRAWER */}
        {showForm && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  {editingId ? "Edit Kategori" : "Tambah Kategori Baru"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kategori akan langsung tersedia di beranda dan formulir tambah produk seller.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Drone, Smart TV, Skincare..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-slate-950 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Deskripsi Singkat (Opsional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Keterangan isi kategori..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded text-slate-900 focus:ring-slate-950"
                  />
                  <span>Kategori Langsung Aktif</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : editingId ? "Perbarui Kategori" : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CATEGORIES TABLE */}
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          {loading ? (
            <p className="py-12 text-center text-slate-500">Memuat kategori...</p>
          ) : filteredCategories.length === 0 ? (
            <div className="py-16 text-center">
              <Sparkles size={36} className="mx-auto text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-800">Tidak ada kategori</h3>
              <p className="mt-1 text-xs text-slate-400">Tidak ditemukan kategori yang sesuai.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Deskripsi</th>
                    <th className="px-6 py-4 text-center">Produk Terhubung</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((cat) => {
                    const IconComponent = getCategoryIcon(cat.name, cat.icon);
                    const productCount = cat._count?.products || 0;

                    return (
                      <tr key={cat.id} className="transition hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                              <IconComponent size={20} />
                            </div>
                            <span className="font-bold text-slate-900">{cat.name}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                          {cat.description || "-"}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            <Package size={13} /> {productCount}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleActive(cat)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                              cat.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                            }`}
                            title="Klik untuk ubah status"
                          >
                            {cat.isActive ? (
                              <>
                                <CheckCircle2 size={13} /> Aktif
                              </>
                            ) : (
                              <>
                                <XCircle size={13} /> Nonaktif
                              </>
                            )}
                          </button>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(cat)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                              title="Edit Kategori"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              onClick={() => handleDelete(cat.id, productCount)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                              title="Hapus / Nonaktifkan"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Categories;
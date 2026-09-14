import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, Shield, Trash2 } from "lucide-react";

interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: "ADMIN" | "SELLER" | "CUSTOMER";
  isVerified: boolean;
  createdAt: string;
  _count?: {
    orders: number;
    products: number;
    reviews: number;
  };
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (roleFilter) queryParams.append("role", roleFilter);

      const response = await fetch(
        `${API_BASE_URL}/admin/users?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data user");
      }

      const data: User[] = await response.json();
      
      const rolePriority = {
        ADMIN: 1,
        SELLER: 2,
        CUSTOMER: 3,
      };

      const sortedUsers = data.sort((a, b) => {
        const diff = rolePriority[a.role] - rolePriority[b.role];
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setUsers(sortedUsers);
    } catch (error) {
      console.error("Users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "ADMIN" | "SELLER" | "CUSTOMER",
  ) => {
    const confirmChange = window.confirm(
      `Apakah Anda yakin ingin mengubah role user ini menjadi ${newRole}?`,
    );
    if (!confirmChange) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (!response.ok) {
        throw new Error("Gagal mengubah role user");
      }

      alert("Role user berhasil diubah");
      fetchUsers();
    } catch (error) {
      console.error("Change role error:", error);
      if (error instanceof Error) alert(error.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus user "${userName}"? Tindakan ini tidak dapat dibatalkan.`,
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Gagal menghapus user");
      }

      alert("User berhasil dihapus");
      fetchUsers();
    } catch (error) {
      console.error("Delete user error:", error);
      if (error instanceof Error) alert(error.message);
    }
  };

  return (
    <AdminLayout
      title="Users Management"
      subtitle="Kelola seluruh pengguna terdaftar, peran, dan hak akses"
    >
      {/* FILTER & SEARCH BAR */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5"
        >
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, username, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
          >
            Cari
          </button>
        </form>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none"
          >
            <option value="">Semua Role</option>
            <option value="CUSTOMER">Customer</option>
            <option value="SELLER">Seller</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Username</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Aktivitas</th>
                <th className="px-6 py-4 font-semibold">Terdaftar</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Memuat data users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada data user yang sesuai.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {u.fullName}
                        </p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      @{u.username}
                    </td>
                    <td className="px-6 py-4">
                      {u.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-sm border border-slate-900">
                          <Shield size={12} className="text-amber-400" />
                          ADMIN
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(
                              u.id,
                              e.target.value as "ADMIN" | "SELLER" | "CUSTOMER",
                            )
                          }
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold border cursor-pointer ${
                            u.role === "SELLER"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="SELLER">SELLER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {u.role === "SELLER" ? (
                        <span>{u._count?.products || 0} Produk</span>
                      ) : (
                        <span>{u._count?.orders || 0} Pesanan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role === "ADMIN" ? (
                        <span className="text-[11px] font-semibold text-slate-300 italic">
                          Protected
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.fullName)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Hapus User"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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

export default Users;

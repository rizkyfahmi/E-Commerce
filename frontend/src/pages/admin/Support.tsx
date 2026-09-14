import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Search,
  CheckCircle2,
  Clock,
  MessageSquare,
  Tag,
  Send,
  Sparkles,
  ShieldCheck,
  User,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
} from "lucide-react";

interface TicketMessage {
  id: string;
  message: string;
  senderId: string;
  isAdmin: boolean;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    role: string;
  };
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED" | "CLOSED";
  priority: string;
  requestedCategoryName?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: "SELLER" | "CUSTOMER" | "ADMIN";
  };
  messages?: TicketMessage[];
  _count?: {
    messages: number;
  };
}

interface AdminStats {
  total: number;
  open: number;
  categoryRequests: number;
  resolved: number;
}

function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    open: 0,
    categoryRequests: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  // Active Chat
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  // Reply
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  const token = localStorage.getItem("token");

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/ticket/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.append("role", roleFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      if (search) params.append("search", search);

      const res = await fetch(`${API_BASE_URL}/ticket/admin/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
        if (window.innerWidth >= 1024 && !selectedTicketId && data.length > 0) {
          setSelectedTicketId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Fetch admin tickets error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTickets();
  }, [roleFilter, statusFilter, categoryFilter, search]);

  useEffect(() => {
    if (!selectedTicketId) {
      setActiveTicket(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setTicketLoading(true);
        const res = await fetch(`${API_BASE_URL}/ticket/${selectedTicketId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setActiveTicket(data);
        }
      } catch (err) {
        console.error("Detail error:", err);
      } finally {
        setTicketLoading(false);
      }
    };

    fetchDetail();
  }, [selectedTicketId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyMessage.trim() || sendingReply) return;

    try {
      setSendingReply(true);
      const res = await fetch(`${API_BASE_URL}/ticket/${selectedTicketId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyMessage.trim() }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setActiveTicket((prev) =>
          prev ? { ...prev, messages: [...(prev.messages || []), newMsg] } : null,
        );
        setReplyMessage("");
        fetchStats();
      }
    } catch (err) {
      console.error("Reply error:", err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleApproveCategory = async () => {
    if (!selectedTicketId) return;
    const catName = activeTicket?.requestedCategoryName || activeTicket?.subject;

    if (!window.confirm(`Setujui request dan buat kategori "${catName}" di marketplace?`)) {
      return;
    }

    try {
      setProcessingAction(true);
      const res = await fetch(
        `${API_BASE_URL}/ticket/${selectedTicketId}/approve-category`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menyetujui request kategori");
      }

      alert(`✅ Berhasil! Kategori "${catName}" telah dibuat dan langsung aktif di marketplace.`);
      fetchStats();
      fetchTickets();

      const refreshRes = await fetch(`${API_BASE_URL}/ticket/${selectedTicketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (refreshRes.ok) {
        setActiveTicket(await refreshRes.json());
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !rejectReason.trim()) return;

    try {
      setProcessingAction(true);
      const res = await fetch(
        `${API_BASE_URL}/ticket/${selectedTicketId}/reject-category`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectReason.trim() }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menolak request");
      }

      alert("Request kategori telah ditolak dan alasan telah dikirimkan ke user.");
      setShowRejectModal(false);
      setRejectReason("");
      fetchStats();
      fetchTickets();

      const refreshRes = await fetch(`${API_BASE_URL}/ticket/${selectedTicketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (refreshRes.ok) {
        setActiveTicket(await refreshRes.json());
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status: Ticket["status"]) => {
    switch (status) {
      case "OPEN":
        return { label: "Open", style: "bg-amber-100 text-amber-800 border-amber-200" };
      case "IN_PROGRESS":
        return { label: "Diproses", style: "bg-blue-100 text-blue-800 border-blue-200" };
      case "RESOLVED":
        return { label: "Selesai", style: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "REJECTED":
        return { label: "Ditolak", style: "bg-red-100 text-red-800 border-red-200" };
      default:
        return { label: status, style: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  return (
    <AdminLayout
      title="Customer Service & Request Hub"
      subtitle="Pusat bantuan pelanggan, keluhan, dan persetujuan request kategori dari Seller/Customer"
    >
      <div className="space-y-6">
        {/* STATS CARDS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <MessageSquare size={18} className="text-slate-900" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Total Tiket
              </span>
            </div>
            <p className="mt-2 sm:mt-4 text-2xl sm:text-3xl font-extrabold text-slate-950">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600">
              <Clock size={18} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Menunggu
              </span>
            </div>
            <p className="mt-2 sm:mt-4 text-2xl sm:text-3xl font-extrabold text-amber-600">
              {stats.open}
            </p>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles size={18} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Req Kategori
              </span>
            </div>
            <p className="mt-2 sm:mt-4 text-2xl sm:text-3xl font-extrabold text-indigo-600">
              {stats.categoryRequests}
            </p>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={18} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Selesai
              </span>
            </div>
            <p className="mt-2 sm:mt-4 text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {stats.resolved}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tiket, subjek, user..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-slate-950 focus:bg-white"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none"
          >
            <option value="">Semua Role</option>
            <option value="SELLER">Seller</option>
            <option value="CUSTOMER">Customer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none"
          >
            <option value="">Semua Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">Diproses</option>
            <option value="RESOLVED">Selesai</option>
            <option value="REJECTED">Ditolak</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none"
          >
            <option value="">Semua Kategori</option>
            <option value="REQUEST_CATEGORY">✨ Request Kategori</option>
            <option value="ORDER">📦 Pesanan</option>
            <option value="PAYMENT">💳 Pembayaran</option>
            <option value="PRODUCT">🛍️ Produk</option>
            <option value="ACCOUNT">👤 Akun</option>
            <option value="OTHER">❓ Lainnya</option>
          </select>
        </div>

        {/* MASTER-DETAIL RESPONSIVE CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          {/* TICKET LIST */}
          <div
            className={`rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm ${
              selectedTicketId ? "hidden lg:block" : "block"
            }`}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Daftar Tiket ({tickets.length})
            </h3>

            {loading ? (
              <p className="py-8 text-center text-xs text-slate-400">Memuat tiket...</p>
            ) : tickets.length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare size={36} className="mx-auto text-slate-300" />
                <p className="mt-2 text-xs font-bold text-slate-700">Tidak ada tiket</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {tickets.map((t) => {
                  const badge = getStatusBadge(t.status);
                  const isSelected = selectedTicketId === t.id;
                  const unreadCount = t._count?.messages || 0;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`cursor-pointer rounded-2xl border p-3.5 sm:p-4 transition ${
                        isSelected
                          ? "border-slate-950 bg-slate-950 text-white shadow-md"
                          : "border-slate-100 bg-slate-50/70 hover:border-slate-300 text-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-[10px] font-bold ${
                              isSelected ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            #{t.ticketNumber}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold ${
                              t.user.role === "SELLER"
                                ? "bg-amber-400 text-slate-950"
                                : "bg-blue-500 text-white"
                            }`}
                          >
                            {t.user.role}
                          </span>
                        </div>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9px] sm:text-[10px] font-bold ${
                            isSelected ? "bg-white/20 text-white border-white/30" : badge.style
                          }`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <h4
                        className={`mt-2 font-bold text-xs line-clamp-1 ${
                          isSelected ? "text-white" : "text-slate-950"
                        }`}
                      >
                        {t.category === "REQUEST_CATEGORY"
                          ? `[Req Kategori] ${t.requestedCategoryName || t.subject}`
                          : t.subject}
                      </h4>

                      <div className="mt-2 flex items-center justify-between text-[10px] sm:text-[11px]">
                        <span className={isSelected ? "text-slate-300" : "text-slate-500 truncate max-w-[140px]"}>
                          {t.user.fullName}
                        </span>

                        {unreadCount > 0 && (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white">
                            🔴 {unreadCount} baru
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTIVE TICKET DETAIL & CHAT */}
          <div
            className={`rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col h-[640px] sm:h-[720px] ${
              !selectedTicketId ? "hidden lg:flex" : "flex"
            }`}
          >
            {activeTicket ? (
              <>
                {/* HEADER */}
                <div className="border-b border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    {/* MOBILE BACK BUTTON */}
                    <button
                      onClick={() => setSelectedTicketId(null)}
                      className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-950 lg:hidden"
                    >
                      <ChevronLeft size={16} />
                      <span>Kembali ke Daftar Tiket</span>
                    </button>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{activeTicket.ticketNumber}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-950 line-clamp-1">
                        {activeTicket.subject}
                      </h3>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-800">
                        {activeTicket.user.fullName}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          activeTicket.user.role === "SELLER"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-blue-100 text-blue-900"
                        }`}
                      >
                        {activeTicket.user.role}
                      </span>
                    </div>
                  </div>

                  {/* SPECIAL ACTION BUTTONS FOR CATEGORY REQUEST */}
                  {activeTicket.category === "REQUEST_CATEGORY" &&
                    activeTicket.status !== "RESOLVED" && (
                      <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                        <button
                          onClick={handleApproveCategory}
                          disabled={processingAction}
                          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <ThumbsUp size={13} />
                          <span>Terima</span>
                        </button>

                        <button
                          onClick={() => setShowRejectModal(true)}
                          disabled={processingAction}
                          className="flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          <ThumbsDown size={13} />
                          <span>Tolak</span>
                        </button>
                      </div>
                    )}
                </div>

                {/* CATEGORY REQUEST BANNER */}
                {activeTicket.category === "REQUEST_CATEGORY" && (
                  <div className="mx-4 sm:mx-6 mt-3 rounded-2xl bg-amber-50 border border-amber-200 p-3 sm:p-4 text-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <Tag size={14} className="text-amber-600" />
                      Permintaan Kategori:
                      <span className="underline">
                        {activeTicket.requestedCategoryName || activeTicket.subject}
                      </span>
                    </div>
                  </div>
                )}

                {/* CHAT MESSAGES SCROLL */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4">
                  {ticketLoading ? (
                    <p className="py-8 text-center text-xs text-slate-400">Memuat pesan...</p>
                  ) : (
                    activeTicket.messages?.map((msg) => {
                      const isMe = msg.isAdmin;
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 sm:gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {!isMe && (
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-800 font-bold text-xs">
                              <User size={15} />
                            </div>
                          )}

                          <div
                            className={`max-w-[82%] sm:max-w-md rounded-2xl p-3.5 sm:p-4 text-xs leading-relaxed ${
                              isMe
                                ? "bg-slate-950 text-white rounded-tr-none"
                                : "bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200/60"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1 opacity-70 text-[9px] sm:text-[10px] font-bold">
                              <span>{isMe ? "Admin Customer Service" : activeTicket.user.fullName}</span>
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          </div>

                          {isMe && (
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm font-bold text-xs">
                              <ShieldCheck size={15} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* ADMIN REPLY BOX */}
                <div className="border-t border-slate-100 p-3 sm:p-4">
                  <form onSubmit={handleSendReply} className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Tulis balasan pesan untuk user..."
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs outline-none focus:border-slate-950 focus:bg-white"
                    />

                    <button
                      type="submit"
                      disabled={sendingReply || !replyMessage.trim()}
                      className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:opacity-40 shrink-0"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <MessageSquare size={44} className="text-slate-300" />
                <h3 className="mt-3 text-sm sm:text-base font-bold text-slate-800">
                  Pilih Tiket untuk Mengelola Chat
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div
          onClick={() => setShowRejectModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl mx-2"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-950">Tolak Request Kategori</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Berikan alasan penolakan agar pengguna memahami keputusannya.
              </p>
            </div>

            <form onSubmit={handleRejectCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Alasan Penolakan *
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Kategori tersebut sudah tercakup dalam kategori Elektronik..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-slate-950"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processingAction}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processingAction ? "Memproses..." : "Tolak Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminSupport;

import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Headphones,
  Plus,
  Send,
  Sparkles,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  User,
  ChevronLeft,
  X,
} from "lucide-react";
import { getUserRole } from "../../lib/auth";

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
  messages?: TicketMessage[];
  _count?: {
    messages: number;
  };
}

const TICKET_CATEGORIES = [
  { id: "REQUEST_CATEGORY", label: "✨ Request Kategori Baru (Khusus Seller / Customer)", isSpecial: true },
  { id: "ORDER", label: "📦 Kendala Pesanan & Pengiriman" },
  { id: "PAYMENT", label: "💳 Masalah Pembayaran & Saldo" },
  { id: "PRODUCT", label: "🛍️ Informasi & Masalah Produk" },
  { id: "ACCOUNT", label: "👤 Akun, Profil, & Keamanan" },
  { id: "STORE", label: "🏪 Pengelolaan Toko Seller" },
  { id: "COMPLAINT", label: "⚠️ Pengaduan / Keluhan Layanan" },
  { id: "SUGGESTION", label: "💡 Saran & Masukan Fitur" },
  { id: "OTHER", label: "❓ Pertanyaan Lainnya" },
];

function CustomerSupport() {
  const navigate = useNavigate();
  const userRole = getUserRole();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  // Form New Ticket
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("REQUEST_CATEGORY");
  const [requestedCategoryName, setRequestedCategoryName] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Chat Reply
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const token = localStorage.getItem("token");

  const fetchMyTickets = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/ticket/my-tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal memuat tiket");
      }

      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);

      // Auto select on desktop only
      if (window.innerWidth >= 1024 && !selectedTicketId && data.length > 0) {
        setSelectedTicketId(data[0].id);
      }
    } catch (err) {
      console.error("Fetch tickets error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  // Fetch active ticket conversation
  useEffect(() => {
    if (!selectedTicketId) {
      setActiveTicket(null);
      return;
    }

    const fetchTicketDetail = async () => {
      try {
        setTicketLoading(true);
        const res = await fetch(`${API_BASE_URL}/ticket/${selectedTicketId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setActiveTicket(data);
        }
      } catch (err) {
        console.error("Fetch ticket detail error:", err);
      } finally {
        setTicketLoading(false);
      }
    };

    fetchTicketDetail();
  }, [selectedTicketId]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) {
      setCreateError("Judul dan pesan bantuan wajib diisi.");
      return;
    }

    if (category === "REQUEST_CATEGORY" && !requestedCategoryName.trim()) {
      setCreateError("Silakan masukkan nama kategori yang diminta.");
      return;
    }

    try {
      setSubmitting(true);
      setCreateError("");

      const res = await fetch(`${API_BASE_URL}/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          requestedCategoryName:
            category === "REQUEST_CATEGORY" ? requestedCategoryName.trim() : undefined,
          message: initialMessage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal membuat tiket bantuan");
      }

      alert("Tiket Customer Service berhasil dibuat! Admin akan segera merespon.");
      setShowCreateModal(false);
      setSubject("");
      setRequestedCategoryName("");
      setInitialMessage("");
      await fetchMyTickets();
      setSelectedTicketId(data.id);
    } catch (err: any) {
      console.error("Create ticket error:", err);
      setCreateError(err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

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
        body: JSON.stringify({
          message: replyMessage.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengirim pesan.");
      }

      const newMsg = await res.json();
      setActiveTicket((prev) =>
        prev
          ? {
              ...prev,
              messages: [...(prev.messages || []), newMsg],
            }
          : null,
      );
      setReplyMessage("");
    } catch (err: any) {
      console.error("Send reply error:", err);
      alert(err.message || "Gagal mengirim pesan.");
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status: Ticket["status"]) => {
    switch (status) {
      case "OPEN":
        return {
          label: "Menunggu Respon",
          style: "bg-amber-100 text-amber-800 border-amber-200",
          icon: Clock,
        };
      case "IN_PROGRESS":
        return {
          label: "Sedang Ditangani",
          style: "bg-blue-100 text-blue-800 border-blue-200",
          icon: MessageSquare,
        };
      case "RESOLVED":
        return {
          label: "Selesai / Diterima",
          style: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: CheckCircle2,
        };
      case "REJECTED":
        return {
          label: "Ditolak",
          style: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          style: "bg-slate-100 text-slate-700 border-slate-200",
          icon: Clock,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] pb-24">
      {/* TOP NAVBAR BANNER */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          <Link
            to={userRole === "SELLER" ? "/seller" : "/"}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={18} />
            {userRole === "SELLER" ? "Kembali ke Dashboard Seller" : "Kembali ke Beranda"}
          </Link>

          <div className="mt-4 sm:mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-md">
                <Headphones size={24} className="sm:size-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950">
                  Customer Service
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Pusat komunikasi langsung dengan Admin Marketplace E-Shop
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-slate-800 self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>Buat Tiket / Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          {/* LEFT: TICKET LIST (HIDDEN ON MOBILE IF CHAT IS ACTIVE) */}
          <div className={`space-y-4 ${selectedTicketId ? "hidden lg:block" : "block"}`}>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Daftar Tiket Anda ({tickets.length})
              </h2>

              {loading ? (
                <p className="py-8 text-center text-xs text-slate-500">Memuat tiket...</p>
              ) : tickets.length === 0 ? (
                <div className="py-10 sm:py-12 text-center">
                  <Headphones size={36} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-xs font-bold text-slate-700">Belum Ada Percakapan</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Kirim pertanyaan, keluhan, atau request kategori ke Admin.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    Mulai Chat Admin
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
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
                          <span
                            className={`font-mono text-[10px] sm:text-[11px] font-bold ${
                              isSelected ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            #{t.ticketNumber}
                          </span>

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
                            isSelected ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {t.category === "REQUEST_CATEGORY" ? `[Kategori] ${t.subject}` : t.subject}
                        </h4>

                        <div className="mt-2.5 flex items-center justify-between text-[10px] sm:text-[11px]">
                          <span className={isSelected ? "text-slate-300" : "text-slate-400"}>
                            {new Date(t.updatedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>

                          {unreadCount > 0 && !isSelected && (
                            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white">
                              {unreadCount} baru
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: ACTIVE TICKET CHAT THREAD (SHOWN ON MOBILE IF TICKET IS SELECTED) */}
          <div
            className={`rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col h-[640px] sm:h-[700px] ${
              !selectedTicketId ? "hidden lg:flex" : "flex"
            }`}
          >
            {activeTicket ? (
              <>
                {/* CHAT HEADER */}
                <div className="border-b border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    {/* MOBILE BACK BUTTON TO TICKET LIST */}
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
                      {activeTicket.category === "REQUEST_CATEGORY" && (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Tag size={11} />
                          {activeTicket.requestedCategoryName || activeTicket.subject}
                        </span>
                      )}
                      <span>
                        Dibuat: {new Date(activeTicket.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div>
                    {(() => {
                      const badge = getStatusBadge(activeTicket.status);
                      const Icon = badge.icon;
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badge.style}`}
                        >
                          <Icon size={13} />
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* ADMIN NOTE BANNER */}
                {activeTicket.adminNote && (
                  <div
                    className={`mx-4 sm:mx-6 mt-3 rounded-2xl p-3 sm:p-4 text-xs font-medium border ${
                      activeTicket.status === "REJECTED"
                        ? "bg-red-50 text-red-900 border-red-200"
                        : "bg-emerald-50 text-emerald-900 border-emerald-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertCircle size={14} />
                      Catatan Admin:
                    </div>
                    {activeTicket.adminNote}
                  </div>
                )}

                {/* MESSAGES SCROLL AREA */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4">
                  {ticketLoading ? (
                    <p className="py-8 text-center text-xs text-slate-400">Memuat pesan...</p>
                  ) : (
                    activeTicket.messages?.map((msg) => {
                      const isMe = !msg.isAdmin;
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 sm:gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {!isMe && (
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm font-bold text-xs">
                              <ShieldCheck size={15} />
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
                              <span>{isMe ? "Anda" : "Customer Service Admin"}</span>
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
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-800 font-bold text-xs">
                              <User size={15} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* REPLY INPUT FORM */}
                <div className="border-t border-slate-100 p-3 sm:p-4">
                  <form onSubmit={handleSendReply} className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Tulis balasan pesan..."
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
              <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-12 text-center">
                <MessageSquare size={44} className="text-slate-300" />
                <h3 className="mt-3 text-sm sm:text-base font-bold text-slate-800">
                  Pilih Tiket untuk Melihat Percakapan
                </h3>
                <p className="mt-1 text-xs text-slate-400 max-w-sm">
                  Pilih tiket di sebelah kiri atau buat tiket bantuan baru.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL CREATE NEW TICKET */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] mx-2"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-950">Buat Tiket Bantuan / Request</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Kirim pertanyaan atau request kategori baru kepada Admin.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {createError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Jenis Bantuan / Request *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold outline-none focus:border-slate-950 focus:bg-white"
                >
                  {TICKET_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {category === "REQUEST_CATEGORY" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Sparkles size={15} className="text-amber-600" />
                    Request Kategori Baru
                  </div>
                  <input
                    type="text"
                    value={requestedCategoryName}
                    onChange={(e) => setRequestedCategoryName(e.target.value)}
                    placeholder="Contoh: Drone, Smart TV, Perlengkapan Bayi..."
                    className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs outline-none focus:border-slate-950"
                    required
                  />
                  <p className="text-[10px] sm:text-[11px] text-amber-700">
                    Jika disetujui, kategori ini otomatis aktif untuk produk Anda.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Subjek / Judul Tiket *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Request Kategori Drone / Pertanyaan Pesanan #123"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-slate-950 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Isi Pesan / Penjelasan *
                </label>
                <textarea
                  rows={4}
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Jelaskan detail pertanyaan atau alasan perlunya kategori baru..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-slate-950 focus:bg-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? "Mengirim..." : "Kirim Tiket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerSupport;

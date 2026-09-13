import {
  Heart,
  ShoppingCart,
  LogOut,
  ClipboardList,
  LayoutDashboard,
  Store,
  Headphones,
  Menu,
  X,
  Sparkles,
  LogIn,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { getHomeRoute } from "../lib/auth";
import ConfirmModal from "./ConfirmModal";


interface NavbarProps {
  cartCount: number;
  hasWishlist: boolean;
}

interface DecodedToken {
  role?: string;
  sub?: string;
  email?: string;
  phone?: string;
  fullName?: string;
}

function Navbar({ cartCount, hasWishlist }: NavbarProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  let userRole = localStorage.getItem("role");

  if (token && !userRole) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      userRole = decoded.role || null;
    } catch {
      userRole = null;
    }
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* LEFT: LOGO */}
          <Link to={getHomeRoute()} className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-900 text-base sm:text-lg font-bold text-white shadow-sm">
              E
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-950">
              E-Shop
            </span>
          </Link>

          {/* CENTER: DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-6 lg:gap-8 md:flex">
            <Link
              to={getHomeRoute()}
              className="text-sm font-semibold text-slate-900 transition hover:text-blue-600"
            >
              Home
            </Link>

            <a
              href="/#products"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Products
            </a>

            <a
              href="/#categories"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Categories
            </a>

            <Link
              to="/orders"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Pesanan
            </Link>
          </div>

          {/* RIGHT: DESKTOP & MOBILE ACTIONS */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* GUEST BADGE */}
            {!token && (
              <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                <Sparkles size={12} className="text-amber-500" />
                Mode Tamu
              </span>
            )}

            {/* ADMIN SHORTCUT (DESKTOP) */}
            {token && userRole === "ADMIN" && (
              <Link
                to="/admin"
                className="hidden sm:flex h-10 items-center gap-1.5 rounded-xl bg-slate-950 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 border border-slate-900"
              >
                <LayoutDashboard size={15} className="text-amber-400" />
                <span>Control Panel</span>
              </Link>
            )}

            {/* SELLER SHORTCUT (DESKTOP) */}
            {token && userRole === "SELLER" && (
              <Link
                to="/seller"
                className="hidden sm:flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Store size={15} />
                <span>Toko Saya</span>
              </Link>
            )}

            {/* WISHLIST BUTTON */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 ${
                hasWishlist ? "text-red-500" : "text-slate-900"
              }`}
            >
              <Heart
                size={18}
                strokeWidth={1.8}
                fill={hasWishlist ? "currentColor" : "none"}
              />
            </Link>

            {/* CUSTOMER SERVICE / BANTUAN */}
            <Link
              to={userRole === "ADMIN" ? "/admin/support" : "/support"}
              aria-label="Customer Service & Bantuan"
              className="hidden sm:flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              title="Customer Service & Bantuan"
            >
              <Headphones size={16} strokeWidth={1.8} className="text-slate-700" />
              <span className="hidden md:inline">Bantuan</span>
            </Link>

            {/* SECURITY / KEAMANAN AKUN */}
            {token && (
              <Link
                to="/security"
                aria-label="Keamanan Akun"
                className="hidden sm:flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                title="Keamanan Akun & Sesi"
              >
                <ShieldCheck size={16} strokeWidth={1.8} className="text-slate-700" />
                <span className="hidden md:inline">Keamanan</span>
              </Link>
            )}

            {/* CART BUTTON */}
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 text-slate-900"
            >
              <ShoppingCart size={18} strokeWidth={1.8} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* DESKTOP LOGIN / REGISTER / LOGOUT */}
            {token ? (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-50 shadow-sm"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 shadow-sm"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* MOBILE HAMBURGER BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 md:hidden items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800 transition hover:bg-slate-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* MOBILE NAVIGATION DRAWER */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* BACKDROP */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* DRAWER CONTENT */}
          <div className="fixed inset-y-0 right-0 w-[82vw] max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              {/* DRAWER HEADER */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-base font-bold text-white">
                    E
                  </div>
                  <div>
                    <span className="block text-sm font-extrabold text-slate-950">E-Shop</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      {token ? userRole || "User" : "Mode Tamu (Guest)"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* GUEST CTA IN MOBILE */}
              {!token && (
                <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-2">
                  <p className="text-xs text-slate-600">
                    Masuk atau daftar untuk belanja dan nikmati fitur lengkap:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 py-2.5 text-xs font-bold text-slate-800 shadow-sm"
                    >
                      <LogIn size={14} />
                      <span>Masuk</span>
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white shadow-sm"
                    >
                      <UserPlus size={14} />
                      <span>Daftar</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* DRAWER LINKS */}
              <div className="p-4 space-y-1">
                {/* ROLE BADGES / SHORTCUTS IN MOBILE */}
                {token && userRole === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 rounded-2xl bg-slate-950 p-3.5 text-xs font-bold text-white shadow-sm mb-2"
                  >
                    <LayoutDashboard size={18} className="text-amber-400" />
                    <div className="flex-1">
                      <span className="block">Panel Admin</span>
                      <span className="text-[10px] text-slate-400">Kelola semua data marketplace</span>
                    </div>
                  </Link>
                )}

                {token && userRole === "SELLER" && (
                  <Link
                    to="/seller"
                    className="flex items-center gap-3 rounded-2xl bg-indigo-600 p-3.5 text-xs font-bold text-white shadow-sm mb-2"
                  >
                    <Store size={18} />
                    <div className="flex-1">
                      <span className="block">Dashboard Toko Seller</span>
                      <span className="text-[10px] text-indigo-200">Kelola barang jualan & pesanan</span>
                    </div>
                  </Link>
                )}

                <Link
                  to={getHomeRoute()}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold text-slate-900 hover:bg-slate-50"
                >
                  <Sparkles size={16} />
                  <span>Halaman Utama (Home)</span>
                </Link>

                <a
                  href="/#products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <span>Katalog Produk</span>
                </a>

                <a
                  href="/#categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <span>Kategori Pilihan</span>
                </a>

                <Link
                  to="/cart"
                  className="flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart size={16} />
                    <span>Keranjang Belanja</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Heart size={16} />
                    <span>Wishlist Favorit</span>
                  </div>
                  {hasWishlist && (
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </Link>

                <Link
                  to="/orders"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ClipboardList size={16} />
                  <span>Riwayat Pesanan</span>
                </Link>

                <Link
                  to="/security"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ShieldCheck size={16} />
                  <span>Keamanan Akun & Sesi</span>
                </Link>

                <Link
                  to="/support"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Headphones size={16} />
                  <span>Customer Service / Bantuan</span>
                </Link>
              </div>
            </div>

            {/* DRAWER FOOTER */}
            <div className="border-t border-slate-100 p-4">
              {token ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3 text-xs font-bold text-red-600 hover:bg-red-100"
                >
                  <LogOut size={16} />
                  <span>Keluar dari Akun (Logout)</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800"
                >
                  <LogIn size={16} />
                  <span>Masuk ke Akun</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={logoutModalOpen}
        title="Konfirmasi Keluar (Logout)"
        message="Apakah Anda yakin ingin keluar dari akun E-Shop Anda? Anda perlu memasukkan email/kata sandi kembali saat ingin berbelanja."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </>
  );
}

export default Navbar;
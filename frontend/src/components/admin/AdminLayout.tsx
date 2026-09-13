import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  FolderTree,
  Package,
  ShoppingBag,
  Star,
  Wallet,
  Settings as SettingsIcon,
  LogOut,
  Home,
  Headphones,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import ConfirmModal from "../ConfirmModal";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users size={18} />,
    },
    {
      name: "Sellers",
      path: "/admin/sellers",
      icon: <Store size={18} />,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: <FolderTree size={18} />,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: <Package size={18} />,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: <ShoppingBag size={18} />,
    },
    {
      name: "Reviews",
      path: "/admin/reviews",
      icon: <Star size={18} />,
    },
    {
      name: "Customer Service",
      path: "/admin/support",
      icon: <Headphones size={18} />,
    },
    {
      name: "Keuangan",
      path: "/admin/finance",
      icon: <Wallet size={18} />,
    },
    {
      name: "Pengaturan",
      path: "/admin/settings",
      icon: <SettingsIcon size={18} />,
    },
  ];

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBILE BACKDROP */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR (SLIDING DRAWER ON MOBILE, FIXED ON DESKTOP) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-16 sm:h-20 items-center justify-between border-b border-slate-100 px-5 sm:px-6">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-900 text-base sm:text-lg font-bold text-white shadow-sm">
              E
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-slate-900">
                E-Shop Admin
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Control Panel
              </span>
            </div>
          </Link>

          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
          <p className="px-3 pb-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Utama
          </p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="border-t border-slate-100 p-3 sm:p-4 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Home size={16} />
            <span>Halaman Utama Toko</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-8 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            {/* MOBILE TOGGLE BUTTON */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 lg:hidden shrink-0"
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/admin/support"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              title="Customer Service"
            >
              <Headphones size={17} />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 sm:p-2 sm:pr-4">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-sm">
                A
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-900 leading-tight">Admin</span>
                <span className="text-[10px] text-slate-400">Super Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>

      {/* ADMIN LOGOUT CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={logoutModalOpen}
        title="Konfirmasi Logout Admin"
        message="Apakah Anda yakin ingin keluar dari Panel Administrator? Anda harus masuk kembali untuk mengelola sistem e-commerce."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </div>
  );
}

export default AdminLayout;

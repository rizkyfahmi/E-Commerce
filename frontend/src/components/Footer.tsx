import { Link } from "react-router-dom";
import { getHomeRoute } from "../lib/auth";

function Footer() {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to={getHomeRoute()} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-slate-950 shadow-sm">
                E
              </div>
              <span className="text-xl font-bold tracking-tight">E-Shop</span>
            </Link>

            <p className="mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-slate-400">
              Platform marketplace multi-role modern untuk kemudahan jual-beli online terpercaya.
            </p>
          </div>

          {/* Belanja */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Belanja</h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="/#products" className="hover:text-white transition">
                  Katalog Produk
                </a>
              </li>
              <li>
                <a href="/#categories" className="hover:text-white transition">
                  Kategori Pilihan
                </a>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition">
                  Wishlist Favorit
                </Link>
              </li>
            </ul>
          </div>

          {/* Layanan & Bantuan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Bantuan</h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/support" className="hover:text-white transition">
                  Customer Service
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition">
                  Lacak Pesanan
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition">
                  Request Kategori
                </Link>
              </li>
            </ul>
          </div>

          {/* Akun & Seller */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Akun</h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Masuk Akun
                </Link>
              </li>
              <li>
                <Link to="/seller" className="hover:text-white transition">
                  Toko Seller
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-900 pt-6 text-center text-xs text-slate-500">
          © 2026 E-Shop Marketplace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
import {
  Sparkles,
  Laptop,
  Headphones,
  Keyboard,
  Mouse,
  Tv,
  Camera,
  Smartphone,
  Tablet,
  Watch,
  Gamepad2,
  Printer,
  HardDrive,
  Cable,
  Plane,
  Shirt,
  Baby,
  Footprints,
  Briefcase,
  Clock,
  Glasses,
  Utensils,
  Armchair,
  Home as HomeIcon,
  Lightbulb,
  Heart,
  Smile,
  Flame,
  Cookie,
  Coffee,
  BookOpen,
  Music,
  Activity,
  Compass,
  Tag,
  X,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  _count?: {
    products: number;
  };
}

interface CategorySectionProps {
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

// Icon Mapping Resolver
export const getCategoryIcon = (name: string, iconName?: string) => {
  const n = (iconName || name || "").toLowerCase();

  if (n.includes("laptop")) return Laptop;
  if (n.includes("audio") || n.includes("headphone") || n.includes("earphone") || n.includes("speaker")) return Headphones;
  if (n.includes("keyboard")) return Keyboard;
  if (n.includes("mouse")) return Mouse;
  if (n.includes("monitor") || n.includes("tv") || n.includes("display")) return Tv;
  if (n.includes("kamera") || n.includes("camera") || n.includes("foto")) return Camera;
  if (n.includes("smartphone") || n.includes("hp") || n.includes("phone")) return Smartphone;
  if (n.includes("tablet") || n.includes("ipad")) return Tablet;
  if (n.includes("smartwatch") || n.includes("watch")) return Watch;
  if (n.includes("game") || n.includes("gaming") || n.includes("console")) return Gamepad2;
  if (n.includes("printer") || n.includes("scanner")) return Printer;
  if (n.includes("penyimpanan") || n.includes("storage") || n.includes("ssd") || n.includes("harddisk")) return HardDrive;
  if (n.includes("kabel") || n.includes("charger") || n.includes("cable")) return Cable;
  if (n.includes("drone") || n.includes("plane")) return Plane;
  if (n.includes("pria") || n.includes("shirt") || n.includes("baju") || n.includes("kaos")) return Shirt;
  if (n.includes("wanita") || n.includes("dress")) return Sparkles;
  if (n.includes("anak") || n.includes("baby")) return Baby;
  if (n.includes("sepatu") || n.includes("sandal") || n.includes("shoes")) return Footprints;
  if (n.includes("tas") || n.includes("dompet") || n.includes("bag")) return Briefcase;
  if (n.includes("jam") || n.includes("clock")) return Clock;
  if (n.includes("kacamata") || n.includes("aksesoris")) return Glasses;
  if (n.includes("dapur") || n.includes("masak") || n.includes("utensil")) return Utensils;
  if (n.includes("furniture") || n.includes("meja") || n.includes("kursi")) return Armchair;
  if (n.includes("rumah") || n.includes("dekorasi")) return HomeIcon;
  if (n.includes("lampu") || n.includes("penerangan")) return Lightbulb;
  if (n.includes("skincare") || n.includes("perawatan") || n.includes("beauty")) return Heart;
  if (n.includes("makeup") || n.includes("kosmetik")) return Smile;
  if (n.includes("parfum") || n.includes("wewangian")) return Flame;
  if (n.includes("makanan") || n.includes("snack") || n.includes("kue")) return Cookie;
  if (n.includes("minuman") || n.includes("kopi") || n.includes("coffee")) return Coffee;
  if (n.includes("buku") || n.includes("tulis") || n.includes("novel")) return BookOpen;
  if (n.includes("musik") || n.includes("gitar")) return Music;
  if (n.includes("olahraga") || n.includes("fitness") || n.includes("gym")) return Activity;
  if (n.includes("outdoor") || n.includes("camping")) return Compass;

  return Tag;
};

function CategorySection({
  selectedCategoryId,
  onSelectCategory,
}: CategorySectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllModal, setShowAllModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/category");
        if (res.ok) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Fetch categories error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredModalCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(modalSearch.toLowerCase().trim()),
  );

  // Top 9 categories to display alongside "Semua" on home
  const topCategories = categories.slice(0, 9);

  return (
    <section id="categories" className="bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Katalog Kategori
            </p>

            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              Shop by Category
            </h2>
          </div>

          <button
            onClick={() => setShowAllModal(true)}
            className="self-start sm:self-auto text-xs sm:text-sm font-bold text-slate-900 transition hover:text-blue-600"
          >
            Lihat Semua Kategori ({categories.length}) →
          </button>
        </div>

        {/* CATEGORY GRID */}
        {loading ? (
          <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="h-24 sm:h-28 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-3">
            {/* ALL / SEMUA BUTTON */}
            <button
              onClick={() => onSelectCategory(null)}
              className={`flex h-24 sm:h-28 flex-col items-center justify-center gap-2 rounded-2xl border p-2.5 sm:p-3 text-center transition ${
                selectedCategoryId === null
                  ? "border-slate-950 bg-slate-950 text-white shadow-md scale-102"
                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              <Sparkles size={20} className="sm:size-6" strokeWidth={selectedCategoryId === null ? 2.5 : 1.8} />
              <span className="text-[11px] sm:text-xs font-bold line-clamp-1">Semua</span>
            </button>

            {/* DYNAMIC CATEGORY BUTTONS */}
            {topCategories.map((category) => {
              const IconComponent = getCategoryIcon(category.name, category.icon);
              const isSelected = selectedCategoryId === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  className={`flex h-24 sm:h-28 flex-col items-center justify-center gap-2 rounded-2xl border p-2.5 sm:p-3 text-center transition ${
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white shadow-md scale-102"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <IconComponent size={20} className="sm:size-6" strokeWidth={isSelected ? 2.5 : 1.8} />
                  <span className="text-[11px] sm:text-xs font-bold line-clamp-1">{category.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ALL CATEGORIES BROWSER MODAL */}
      {/* ========================================================================= */}
      {showAllModal && (
        <div
          onClick={() => setShowAllModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col mx-2"
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-950">Semua Kategori Marketplace</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Pilih kategori untuk memfilter katalog produk di beranda.
                </p>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* SEARCH IN MODAL */}
            <div className="p-4 sm:p-6 pb-2 border-b border-slate-50">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Cari kategori produk..."
                  className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* CATEGORIES GRID */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {/* SEMUA BUTTON IN MODAL */}
                <button
                  onClick={() => {
                    onSelectCategory(null);
                    setShowAllModal(false);
                  }}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 sm:p-4 text-left transition ${
                    selectedCategoryId === null
                      ? "border-slate-950 bg-slate-950 text-white font-bold"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-900"
                  }`}
                >
                  <Sparkles size={20} className="shrink-0" />
                  <div>
                    <span className="text-xs sm:text-sm font-bold block">Semua Produk</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 block">Tampilkan semua</span>
                  </div>
                </button>

                {filteredModalCategories.map((cat) => {
                  const Icon = getCategoryIcon(cat.name, cat.icon);
                  const isSelected = selectedCategoryId === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setShowAllModal(false);
                      }}
                      className={`flex items-center gap-3 rounded-2xl border p-3.5 sm:p-4 text-left transition ${
                        isSelected
                          ? "border-slate-950 bg-slate-950 text-white font-bold"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-900"
                      }`}
                    >
                      <Icon size={18} className="shrink-0 text-slate-700" />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-bold block truncate">{cat.name}</span>
                        {cat.description && (
                          <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                            {cat.description}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CategorySection;
function Hero() {
  return (
    <section id="home" className="bg-[#f7f7f5] overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-8 sm:gap-12 px-4 sm:px-6 py-12 sm:py-20 lg:grid-cols-2 lg:py-24">
        {/* Left */}
        <div>
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-slate-700 shadow-sm">
            <span className="text-sm">🔥</span>
            Trending Marketplace
          </div>

          <h1 className="max-w-2xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] sm:leading-[0.95] tracking-tight sm:tracking-[-0.04em] text-slate-950">
            Upgrade Your
            <br />
            <span className="text-slate-500">Digital Life.</span>
          </h1>

          <p className="mt-4 sm:mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600 md:text-lg">
            Temukan ribuan produk teknologi dan kebutuhan harian terbaik dengan kualitas terjamin,
            harga hemat, dan pengalaman belanja multi-role seperti Shopee.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            <a
              href="#products"
              className="w-full sm:w-auto text-center rounded-2xl bg-slate-950 px-6 sm:px-8 py-3.5 text-xs sm:text-sm font-bold text-white transition hover:bg-slate-800 shadow-md"
            >
              Belanja Sekarang →
            </a>

            <a
              href="#categories"
              className="w-full sm:w-auto text-center rounded-2xl border border-slate-200 bg-white px-6 sm:px-8 py-3.5 text-xs sm:text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            >
              Lihat Kategori
            </a>
          </div>

          {/* Statistics */}
          <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-8 border-t border-slate-200/60 pt-6">
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-950">10K+</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Produk Aktif
              </p>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-950">5K+</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pengguna
              </p>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-950">4.9</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Kepuasan Rating
              </p>
            </div>
          </div>
        </div>

        {/* Right Banner Image */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl sm:rounded-[2rem] bg-slate-200 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1400&auto=format&fit=crop"
              alt="Laptop Tech Showcase"
              className="h-64 sm:h-96 lg:h-[480px] w-full object-cover"
            />
          </div>

          {/* Flash Sale Badge */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur px-4 py-3 sm:px-5 sm:py-4 shadow-xl border border-white">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-950 text-base sm:text-lg">
              ⚡
            </div>

            <div>
              <p className="text-xs sm:text-sm font-black text-slate-950">Promo Spesial</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500">Diskon s/d 40%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
// Uniform Square Payment Logos (All logos have standard 1:1 aspect ratio, e.g. 40x40px)

// BCA Logo (Persegi)
export function BcaLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-[#005EAA] shadow-xs border border-blue-700/30 ${className}`}
      title="BCA"
    >
      <span className="text-[11px] font-black italic tracking-wider text-white leading-none">
        BCA
      </span>
      <span className="text-[7px] font-bold text-blue-200 uppercase tracking-tighter leading-none mt-0.5">
        Bank
      </span>
    </div>
  );
}

// Mandiri Logo (Persegi)
export function MandiriLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-[#003D79] shadow-xs border border-blue-900/30 ${className}`}
      title="Bank Mandiri"
    >
      <div className="flex items-center gap-0.5 leading-none">
        <span className="text-[10px] font-black text-white leading-none">mandırı</span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#F39800] -mt-1.5"></span>
      </div>
      <span className="text-[7px] font-semibold text-amber-400 uppercase tracking-tighter leading-none mt-0.5">
        Livin'
      </span>
    </div>
  );
}

// BRI Logo (Persegi)
export function BriLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-[#00529C] shadow-xs border border-blue-800/30 ${className}`}
      title="Bank BRI"
    >
      <span className="text-[12px] font-black tracking-wider text-white leading-none">
        BRI
      </span>
      <span className="text-[8px] font-black text-[#EF7D00] uppercase tracking-wider leading-none mt-0.5">
        BRIVA
      </span>
    </div>
  );
}

// BNI Logo (Persegi)
export function BniLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-[#005E6A] shadow-xs border border-teal-800/30 ${className}`}
      title="Bank BNI"
    >
      <span className="text-[12px] font-black tracking-wider text-white leading-none">
        BNI
      </span>
      <span className="text-[8px] font-black text-[#F15A24] font-serif leading-none mt-0.5">
        46
      </span>
    </div>
  );
}

// Permata Logo (Persegi)
export function PermataLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#008144] to-[#88B838] shadow-xs border border-emerald-700/30 ${className}`}
      title="Permata Bank"
    >
      <div className="h-2.5 w-2.5 rotate-45 bg-[#E60000] shadow-2xs"></div>
      <span className="text-[8px] font-black tracking-tight text-white leading-none mt-1">
        Permata
      </span>
    </div>
  );
}

// GoPay Logo (Persegi)
export function GopayLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-[#00AED6] shadow-xs border border-cyan-600/30 ${className}`}
      title="GoPay"
    >
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#00AED6] font-black text-[11px] shadow-2xs">
        G
      </div>
      <span className="text-[7px] font-black tracking-tight leading-none text-white mt-0.5">
        gopay
      </span>
    </div>
  );
}

// OVO Logo (Persegi)
export function OvoLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-[#4C3494] shadow-xs border border-purple-900/30 ${className}`}
      title="OVO"
    >
      <span className="text-[13px] font-black tracking-wider text-white leading-none">
        OVO
      </span>
      <span className="text-[7px] font-bold text-purple-200 uppercase tracking-tighter leading-none mt-0.5">
        Pay
      </span>
    </div>
  );
}

// ShopeePay Logo (Persegi)
export function ShopeepayLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-[#EE4D2D] shadow-xs border border-orange-700/30 ${className}`}
      title="ShopeePay"
    >
      <span className="text-xs leading-none">🛍️</span>
      <span className="text-[7px] font-black tracking-tight leading-none text-white mt-0.5">
        ShopeePay
      </span>
    </div>
  );
}

// DANA Logo (Persegi)
export function DanaLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-[#118EEA] shadow-xs border border-blue-600/30 ${className}`}
      title="DANA"
    >
      <span className="text-[11px] font-black tracking-wider text-white leading-none">
        DANA
      </span>
      <span className="text-[7px] font-bold text-blue-100 uppercase tracking-tighter leading-none mt-0.5">
        Dompet
      </span>
    </div>
  );
}

// QRIS Logo (Persegi)
export function QrisLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl border border-red-300 bg-white shadow-xs ${className}`}
      title="QRIS"
    >
      <span className="text-[#E1251B] font-black text-[12px] tracking-tighter leading-none">
        QRIS
      </span>
      <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter leading-none mt-0.5">
        Scan
      </span>
    </div>
  );
}

// Visa Logo (Persegi)
export function VisaLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-[#1A1F71] shadow-xs border border-blue-950/40 ${className}`}
      title="VISA"
    >
      <span className="font-serif font-black italic text-[12px] tracking-wider text-[#F7B600] leading-none">
        VISA
      </span>
      <span className="text-[7px] font-bold text-slate-200 uppercase tracking-tighter leading-none mt-0.5">
        Card
      </span>
    </div>
  );
}

// Mastercard Logo (Persegi)
export function MastercardLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-slate-900 shadow-xs border border-slate-700/40 ${className}`}
      title="Mastercard"
    >
      <div className="flex -space-x-1.5 items-center">
        <div className="h-3.5 w-3.5 rounded-full bg-[#EB001B]"></div>
        <div className="h-3.5 w-3.5 rounded-full bg-[#F79E1B]/95"></div>
      </div>
      <span className="text-[6px] font-bold text-slate-300 tracking-tight leading-none mt-0.5">
        mastercard
      </span>
    </div>
  );
}

// JCB Logo (Persegi)
export function JcbLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-white border border-slate-300 shadow-xs ${className}`}
      title="JCB"
    >
      <div className="flex gap-0.5">
        <span className="bg-[#00377B] text-white text-[8px] font-black px-1 rounded-xs">J</span>
        <span className="bg-[#DA0011] text-white text-[8px] font-black px-1 rounded-xs">C</span>
        <span className="bg-[#00873C] text-white text-[8px] font-black px-1 rounded-xs">B</span>
      </div>
      <span className="text-[6px] font-bold text-slate-500 uppercase tracking-tighter leading-none mt-0.5">
        Card
      </span>
    </div>
  );
}

// Indomaret Logo (Persegi)
export function IndomaretLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl border border-slate-300 bg-white shadow-xs ${className}`}
      title="Indomaret"
    >
      <div className="flex h-3.5 w-5 items-center justify-center rounded-xs bg-gradient-to-r from-[#005BAA] via-[#EF3B24] to-[#FDB913]">
        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
      </div>
      <span className="text-[7px] font-black text-[#005BAA] leading-none mt-0.5">
        Indomaret
      </span>
    </div>
  );
}

// Alfamart Logo (Persegi)
export function AlfamartLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-[#E31B23] shadow-xs border border-red-700/30 ${className}`}
      title="Alfamart"
    >
      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#005BAA] text-[9px] text-white font-black shadow-2xs">
        A
      </div>
      <span className="text-[7px] font-black text-white leading-none tracking-tight mt-0.5">
        Alfamart
      </span>
    </div>
  );
}

// SPayLater Logo (Persegi)
export function SpaylaterLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#EE4D2D] to-[#FF7337] shadow-xs border border-orange-600/30 text-white ${className}`}
      title="SPayLater"
    >
      <span className="text-[11px] leading-none">⚡</span>
      <span className="text-[8px] font-black leading-none mt-0.5">SPayLater</span>
    </div>
  );
}

// Kredivo Logo (Persegi)
export function KredivoLogo({ className = "h-10 w-10 min-w-[40px]" }: { className?: string }) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl bg-[#008A90] shadow-xs border border-teal-700/30 text-white ${className}`}
      title="Kredivo"
    >
      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF8200] font-black text-[9px] text-white shadow-2xs">
        K
      </div>
      <span className="text-[7px] font-black leading-none mt-0.5">kredivo</span>
    </div>
  );
}

// Dynamic Payment Method Logo Selector
export default function PaymentMethodLogo({
  method,
  className = "h-10 w-10 min-w-[40px]",
}: {
  method?: string;
  className?: string;
}) {
  if (!method) return null;

  const m = method.toUpperCase();

  if (m.includes("BCA")) return <BcaLogo className={className} />;
  if (m.includes("MANDIRI")) return <MandiriLogo className={className} />;
  if (m.includes("BRI")) return <BriLogo className={className} />;
  if (m.includes("BNI")) return <BniLogo className={className} />;
  if (m.includes("PERMATA")) return <PermataLogo className={className} />;
  if (m.includes("GOPAY")) return <GopayLogo className={className} />;
  if (m.includes("OVO")) return <OvoLogo className={className} />;
  if (m.includes("SHOPEEPAY")) return <ShopeepayLogo className={className} />;
  if (m.includes("DANA")) return <DanaLogo className={className} />;
  if (m.includes("QRIS")) return <QrisLogo className={className} />;
  if (m.includes("VISA")) return <VisaLogo className={className} />;
  if (m.includes("MASTERCARD") || m.includes("CREDIT_CARD") || m.includes("CC"))
    return <MastercardLogo className={className} />;
  if (m.includes("JCB")) return <JcbLogo className={className} />;
  if (m.includes("INDOMARET")) return <IndomaretLogo className={className} />;
  if (m.includes("ALFAMART")) return <AlfamartLogo className={className} />;
  if (m.includes("SPAYLATER")) return <SpaylaterLogo className={className} />;
  if (m.includes("KREDIVO")) return <KredivoLogo className={className} />;

  return null;
}

import { API_BASE_URL } from "../../lib/config";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  ShieldCheck,
  Zap,
  MapPin,
  Truck,
  Ticket,
  CheckCircle2,
  Building2,
  Smartphone,
  QrCode,
  CreditCard,
  Store,
  Lock,
  Check,
  HelpCircle,
  BookOpen,
  Info,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import PaymentInstructionsModal from "../../components/PaymentInstructionsModal";
import type { PaymentModalOrder } from "../../components/PaymentInstructionsModal";
import {
  BcaLogo,
  MandiriLogo,
  BriLogo,
  BniLogo,
  PermataLogo,
  GopayLogo,
  OvoLogo,
  ShopeepayLogo,
  DanaLogo,
  QrisLogo,
  VisaLogo,
  MastercardLogo,
  JcbLogo,
  IndomaretLogo,
  AlfamartLogo,
  SpaylaterLogo,
  KredivoLogo,
} from "../../components/PaymentLogos";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  sellerId?: string;
  seller?: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface ItemToCheckout {
  id: string;
  quantity: number;
  product: Product;
}

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  fullAddress: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Rumah Utama",
    recipientName: "Budi Santoso",
    phone: "+62 812-3456-7890",
    fullAddress: "Jl. Jenderal Sudirman No. 123, Komplek Niaga Plaza Blok B2",
    city: "Jakarta Pusat",
    postalCode: "10220",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Kantor / Tempat Kerja",
    recipientName: "Budi Santoso (Divisi IT)",
    phone: "+62 812-3456-7890",
    fullAddress: "Gedung Cyber 2 Tower Lt. 15, Jl. HR Rasuna Said Blok X-5",
    city: "Jakarta Selatan",
    postalCode: "12950",
    isDefault: false,
  },
];

const SHIPPING_OPTIONS = [
  {
    id: "reguler",
    name: "Reguler (JNE / SiCepat / J&T)",
    etd: "2 - 3 Hari Kerja",
    cost: 12000,
    icon: "🚚",
  },
  {
    id: "express",
    name: "Next Day Express",
    etd: "1 Hari Tiba",
    cost: 24000,
    icon: "⚡",
  },
  {
    id: "instant",
    name: "Instant / Same Day (GoSend / Grab)",
    etd: "3 - 6 Jam Tiba",
    cost: 30000,
    icon: "🛵",
  },
  {
    id: "cargo",
    name: "Kargo Hemat (Barang Besar)",
    etd: "4 - 6 Hari Kerja",
    cost: 45000,
    icon: "📦",
  },
];

const PROMO_VOUCHERS = [
  {
    code: "DISKONHEMAT",
    title: "Diskon Belanja Rp 20.000",
    description: "Min. belanja Rp 50.000 untuk semua produk",
    discount: 20000,
    minSpend: 50000,
    type: "FLAT",
  },
  {
    code: "GRATISONGKIR",
    title: "Potongan Ongkos Kirim Rp 12.000",
    description: "Subsidi ongkir tanpa minimum transaksi",
    discount: 12000,
    minSpend: 0,
    type: "SHIPPING",
  },
  {
    code: "SUPERDEAL10",
    title: "Diskon Ekstra 10%",
    description: "Maksimal potongan hingga Rp 50.000",
    discount: 0,
    discountPercent: 0.1,
    maxDiscount: 50000,
    minSpend: 100000,
    type: "PERCENT",
  },
];

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const directItem = location.state?.directItem as
    | { product: Product; quantity: number }
    | undefined;

  const [checkoutItems, setCheckoutItems] = useState<ItemToCheckout[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  // Address State
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("addr-1");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Alamat Baru",
    recipientName: "",
    phone: "",
    fullAddress: "",
    city: "",
    postalCode: "",
  });

  // Shipping & Courier State
  const [selectedShippingId, setSelectedShippingId] = useState<string>("reguler");

  // Voucher State
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
    title: string;
  } | null>(null);
  const [voucherError, setVoucherError] = useState("");

  // Payment Method State
  const [paymentCategory, setPaymentCategory] = useState<
    "VA" | "EWALLET" | "QRIS" | "CC" | "RETAIL" | "PAYLATER"
  >("VA");
  const [paymentMethod, setPaymentMethod] = useState<string>("BCA_VA");

  // Credit Card Form State (Mocked)
  const [ccNumber, setCcNumber] = useState("");
  const [ccExpiry, setCcExpiry] = useState("");
  const [ccCvv, setCcCvv] = useState("");

  // PayLater Tenor State
  const [payLaterTenor, setPayLaterTenor] = useState<number>(1);
  const [guideSubTab, setGuideSubTab] = useState<"mbanking" | "atm" | "ibanking">("mbanking");

  // Post-Checkout Modal State
  const [createdOrder, setCreatedOrder] = useState<PaymentModalOrder | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  const getMethodReadableName = (m: string) => {
    switch (m) {
      case "BCA_VA": return "BCA Virtual Account";
      case "MANDIRI_VA": return "Mandiri Virtual Account";
      case "BRI_VA": return "BRI Virtual Account (BRIVA)";
      case "BNI_VA": return "BNI Virtual Account";
      case "PERMATA_VA": return "Permata Virtual Account";
      case "GOPAY": return "GoPay";
      case "OVO": return "OVO";
      case "SHOPEEPAY": return "ShopeePay";
      case "DANA": return "DANA";
      case "QRIS": return "QRIS Standar Nasional";
      case "CREDIT_CARD": return "Kartu Debit / Kredit";
      case "INDOMARET": return "Indomaret / Ceriamart";
      case "ALFAMART": return "Alfamart / Alfamidi";
      case "SPAYLATER": return "SPayLater";
      case "KREDIVO": return "Kredivo PayLater";
      default: return m;
    }
  };

  const getPaymentGuideSteps = (m: string, tab: "mbanking" | "atm" | "ibanking") => {
    if (m === "BCA_VA") {
      if (tab === "mbanking") {
        return [
          { title: "Buka BCA mobile", desc: "Masuk ke aplikasi BCA mobile, masukkan Kode Akses dan pilih menu 'm-Transfer'." },
          { title: "Pilih BCA Virtual Account", desc: "Pilih opsi 'BCA Virtual Account' pada menu transfer." },
          { title: "Input Nomor Virtual Account", desc: "Masukkan nomor BCA VA pesanan Anda (88008xxxxxxxx) lalu klik 'Send'." },
          { title: "Cek Data & Tagihan", desc: "Pastikan nama penerima dan nominal tagihan belanja Anda sudah sesuai." },
          { title: "Konfirmasi PIN m-BCA", desc: "Masukkan PIN m-BCA Anda untuk menyelesaikan pembayaran. Simpan bukti transfer." },
        ];
      }
      if (tab === "atm") {
        return [
          { title: "Masukkan Kartu ATM", desc: "Masukkan kartu ATM BCA dan 6 digit PIN rahasia Anda di mesin ATM." },
          { title: "Pilih Menu Transaksi", desc: "Pilih menu 'Transaksi Lainnya' > 'Transfer' > 'Ke Rek BCA Virtual Account'." },
          { title: "Masukkan Nomor VA", desc: "Ketik nomor BCA Virtual Account pesanan Anda lalu tekan 'Benar'." },
          { title: "Validasi Pembayaran", desc: "Periksa informasi transaksi di layar ATM lalu tekan 'Ya' jika sudah benar." },
          { title: "Ambil Struk", desc: "Transaksi selesai, ambil struk pembayaran sebagai bukti transaksi sah." },
        ];
      }
      return [
        { title: "Login KlikBCA", desc: "Buka website KlikBCA Individual dan login dengan User ID & PIN Anda." },
        { title: "Pilih Menu Transfer", desc: "Pilih menu 'Transfer Dana' > 'Transfer ke BCA Virtual Account'." },
        { title: "Masukkan Nomor VA", desc: "Ketik nomor Virtual Account pesanan Anda lalu klik 'Lanjutkan'." },
        { title: "Otorisasi KeyBCA", desc: "Nyalakan KeyBCA, masukkan respon APPLI 1 dan klik 'Kirim'." },
      ];
    }

    if (m === "MANDIRI_VA") {
      if (tab === "mbanking") {
        return [
          { title: "Buka Livin' by Mandiri", desc: "Login ke aplikasi Livin' by Mandiri di smartphone Anda." },
          { title: "Pilih Menu Bayar", desc: "Pilih menu 'Bayar' lalu ketik atau cari penyedia jasa / Mandiri VA." },
          { title: "Input Nomor VA", desc: "Masukkan nomor Mandiri Virtual Account pesanan Anda (89608xxxxxxxx)." },
          { title: "Konfirmasi & Bayar", desc: "Pastikan detail tagihan sesuai, lalu masukkan PIN Livin' Mandiri Anda." },
        ];
      }
      if (tab === "atm") {
        return [
          { title: "Masukkan Kartu di ATM Mandiri", desc: "Masukkan kartu debit Mandiri dan PIN Anda." },
          { title: "Pilih Menu Bayar/Beli", desc: "Pilih menu 'Bayar/Beli' > 'Pendidikan' / 'Multi Payment'." },
          { title: "Masukkan Kode Perusahaan & VA", desc: "Ketik nomor Mandiri Virtual Account Anda lalu tekan 'Benar'." },
          { title: "Selesaikan Transaksi", desc: "Pilih angka 1 untuk menyetujui pembayaran dan cetak bukti struk ATM." },
        ];
      }
      return [
        { title: "Login Mandiri Online", desc: "Masuk ke situs Mandiri Online Internet Banking." },
        { title: "Menu Pembayaran", desc: "Pilih 'Pembayaran' > 'Multi Payment' > Pilih rekening sumber." },
        { title: "Konfirmasi Token", desc: "Masukkan nomor Virtual Account lalu otorisasi dengan Mandiri PIN Token." },
      ];
    }

    if (m === "BRI_VA") {
      if (tab === "mbanking") {
        return [
          { title: "Login BRImo", desc: "Buka aplikasi BRImo dan lakukan login akun." },
          { title: "Pilih Menu BRIVA", desc: "Pilih menu 'Tagihan' atau 'BRIVA' di halaman utama." },
          { title: "Input Nomor BRIVA", desc: "Pilih 'Tambah Pembayaran Baru' dan masukkan nomor BRIVA Anda (10777xxxxxxxx)." },
          { title: "Konfirmasi PIN BRImo", desc: "Periksa nama pelanggan dan nominal, lalu masukkan PIN BRImo untuk membayar." },
        ];
      }
      return [
        { title: "Masukkan Kartu ATM BRI", desc: "Masukkan kartu ATM dan PIN Anda di mesin ATM BRI." },
        { title: "Pilih Transaksi Lain", desc: "Pilih menu 'Transaksi Lain' > 'Pembayaran' > 'Lainnya' > 'BRIVA'." },
        { title: "Masukkan Nomor BRIVA", desc: "Ketik nomor Virtual Account BRIVA Anda lalu tekan 'Ya'." },
        { title: "Selesai", desc: "Pembayaran terverifikasi otomatis dalam hitungan detik." },
      ];
    }

    if (m === "BNI_VA") {
      return [
        { title: "Buka BNI Mobile Banking", desc: "Login ke aplikasi BNI Mobile Banking di ponsel Anda." },
        { title: "Pilih Menu Pembayaran", desc: "Pilih menu 'Pembayaran' > 'Virtual Account Billing'." },
        { title: "Input Nomor VA BNI", desc: "Pilih tab 'Input Baru' dan masukkan nomor BNI Virtual Account (988xxxxxxxx)." },
        { title: "Masukkan Password Transaksi", desc: "Konfirmasi nominal tagihan dan masukkan Password Transaksi BNI Anda." },
      ];
    }

    if (m === "PERMATA_VA") {
      return [
        { title: "Login PermataMobile X", desc: "Buka aplikasi PermataMobile X di smartphone Anda." },
        { title: "Pilih Bayar Tagihan", desc: "Pilih menu 'Bayar Tagihan' > 'Virtual Account'." },
        { title: "Ketik Nomor Permata VA", desc: "Masukkan nomor Virtual Account pesanan Anda (8528xxxxxxxx)." },
        { title: "Konfirmasi Mobile PIN", desc: "Verifikasi total pembayaran dan masukkan Mobile PIN Permata Anda." },
      ];
    }

    if (["GOPAY", "OVO", "SHOPEEPAY", "DANA"].includes(m)) {
      return [
        { title: "Pastikan Saldo Cukup", desc: `Periksa saldo dompet digital ${m} Anda mencukupi total nominal belanja.` },
        { title: "Klik Bayar Sekarang", desc: "Tekan tombol 'Bayar Sekarang' untuk menerbitkan tagihan pesanan resmi." },
        { title: "Buka Aplikasi E-Wallet", desc: `Buka aplikasi ${m} atau klik notifikasi tagihan yang otomatis masuk ke ponsel Anda.` },
        { title: "Otorisasi Pembayaran", desc: "Periksa nama merchant dan nominal, lalu masukkan PIN E-Wallet untuk menyelesaikan transaksi." },
      ];
    }

    if (m === "QRIS") {
      return [
        { title: "Buka Aplikasi Pembayaran", desc: "Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, ShopeePay, DANA)." },
        { title: "Pilih Menu Scan QR / QRIS", desc: "Ketuk ikon Scan QRIS di halaman utama aplikasi pilihan Anda." },
        { title: "Arahkan Kamera ke QR", desc: "Arahkan kamera smartphone ke kode QRIS yang tampil di layar pembayaran." },
        { title: "Konfirmasi Nama & Nominal", desc: "Pastikan merchant tertulis 'E-Commerce Store' dengan nominal yang sesuai." },
        { title: "Masukkan PIN", desc: "Ketik PIN aplikasi Anda dan pembayaran akan langsung lunas terverifikasi seketika." },
      ];
    }

    if (m === "CREDIT_CARD") {
      return [
        { title: "Lengkapi Data Kartu", desc: "Masukkan 16 digit nomor kartu kredit/debit, tanggal kedaluwarsa (MM/YY), dan 3 digit CVV." },
        { title: "Klik Bayar Sekarang", desc: "Tekan tombol 'Bayar Sekarang' untuk memproses otorisasi pembayaran." },
        { title: "Verifikasi 3D Secure OTP", desc: "Pihak bank penerbit kartu akan mengirimkan kode SMS OTP ke nomor ponsel Anda." },
        { title: "Input Kode OTP", desc: "Masukkan kode OTP sebelum batas waktu habis untuk menyelesaikan transaksi secara aman." },
      ];
    }

    if (["INDOMARET", "ALFAMART"].includes(m)) {
      return [
        { title: "Kunjungi Gerai Terdekat", desc: `Datangi gerai ${m === "INDOMARET" ? "Indomaret / Ceriamart" : "Alfamart / Alfamidi"} terdekat.` },
        { title: "Sampaikan ke Kasir", desc: "Katakan kepada petugas kasir bahwa Anda ingin membayar transaksi 'E-Commerce'." },
        { title: "Tunjukkan Kode Bayar", desc: "Tunjukkan Kode Pembayaran Kasir yang tertera pada layar instruksi pesanan Anda." },
        { title: "Bayar Sesuai Nominal", desc: "Serahkan uang tunai atau kartu debit ke kasir sesuai total tagihan tanpa biaya tambahan." },
        { title: "Simpan Struk Fisik", desc: "Terima dan simpan struk resmi dari kasir sebagai bukti pembayaran yang sah." },
      ];
    }

    if (["SPAYLATER", "KREDIVO"].includes(m)) {
      return [
        { title: "Tentukan Skema Tenor", desc: "Pilih jangka waktu cicilan yang Anda kehendaki (1x 30 hari, 3 bulan, 6 bulan, atau 12 bulan)." },
        { title: "Tekan Bayar Sekarang", desc: "Klik tombol 'Bayar Sekarang' untuk memulai proses kontrak pembiayaan digital." },
        { title: "Otorisasi Akun PayLater", desc: `Konfirmasi transaksi di sistem ${m === "SPAYLATER" ? "ShopeePayLater" : "Kredivo"} berizin OJK.` },
        { title: "Bayar Tagihan Bulanan", desc: "Lakukan pembayaran cicilan rutin setiap bulan sebelum tanggal jatuh tempo melalui transfer bank." },
      ];
    }

    return [
      { title: "Selesaikan Tagihan", desc: "Ikuti panduan pembayaran sesuai metode yang Anda pilih." },
      { title: "Verifikasi Otomatis", desc: "Sistem akan mendeteksi pelunasan Anda secara otomatis dalam hitungan detik." },
    ];
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (directItem) {
      setCheckoutItems([
        {
          id: `direct-${directItem.product.id}`,
          quantity: directItem.quantity || 1,
          product: directItem.product,
        },
      ]);
      setLoading(false);
    } else {
      const fetchCart = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/cart`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Gagal mengambil data keranjang");
          }

          const data = await response.json();
          setCheckoutItems(data);
        } catch (err: any) {
          console.error("Checkout cart error:", err);
          setError("Gagal mengambil data keranjang belanja");
        } finally {
          setLoading(false);
        }
      };

      fetchCart();
    }
  }, [directItem, token, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculations
  const subtotal = checkoutItems.reduce(
    (acc, it) => acc + (it.product.price || 0) * (it.quantity || 1),
    0,
  );

  const selectedShipping = SHIPPING_OPTIONS.find((s) => s.id === selectedShippingId) || SHIPPING_OPTIONS[0];
  const shippingCost = selectedShipping.cost;
  const serviceFee = 1000; // Biaya Layanan Standar Transaksi Aman

  let discountAmount = 0;
  if (appliedVoucher) {
    discountAmount = appliedVoucher.discount;
  }

  const grandTotal = Math.max(0, subtotal + shippingCost + serviceFee - discountAmount);

  // PayLater monthly calculation
  const getPayLaterMonthly = (tenor: number) => {
    const interestRate = tenor === 1 ? 0 : tenor === 3 ? 0.015 : tenor === 6 ? 0.02 : 0.025;
    const totalWithInterest = grandTotal * (1 + interestRate * tenor);
    return Math.round(totalWithInterest / tenor);
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  // Voucher Application Handler
  const handleApplyVoucher = (codeToApply?: string) => {
    const code = (codeToApply || voucherInput).trim().toUpperCase();
    setVoucherError("");

    if (!code) {
      setVoucherError("Silakan masukkan kode voucher");
      return;
    }

    const matched = PROMO_VOUCHERS.find((v) => v.code === code);
    if (!matched) {
      setVoucherError("Kode voucher tidak valid atau sudah kedaluwarsa");
      return;
    }

    if (subtotal < matched.minSpend) {
      setVoucherError(`Minimum belanja untuk voucher ini adalah ${formatPrice(matched.minSpend)}`);
      return;
    }

    let calculatedDiscount = 0;
    if (matched.type === "FLAT") {
      calculatedDiscount = matched.discount;
    } else if (matched.type === "SHIPPING") {
      calculatedDiscount = Math.min(shippingCost, matched.discount);
    } else if (matched.type === "PERCENT") {
      calculatedDiscount = Math.min(
        subtotal * (matched.discountPercent || 0.1),
        matched.maxDiscount || 50000,
      );
    }

    setAppliedVoucher({
      code: matched.code,
      discount: calculatedDiscount,
      title: matched.title,
    });
    setVoucherInput("");
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError("");
  };

  // Add Address Handler
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.recipientName || !newAddress.phone || !newAddress.fullAddress) return;

    const newId = `addr-${Date.now()}`;
    const created: Address = {
      id: newId,
      label: newAddress.label || "Alamat Baru",
      recipientName: newAddress.recipientName,
      phone: newAddress.phone,
      fullAddress: newAddress.fullAddress,
      city: newAddress.city || "DKI Jakarta",
      postalCode: newAddress.postalCode || "12000",
      isDefault: false,
    };

    setAddresses([...addresses, created]);
    setSelectedAddressId(newId);
    setShowAddressModal(false);
    setNewAddress({
      label: "Alamat Baru",
      recipientName: "",
      phone: "",
      fullAddress: "",
      city: "",
      postalCode: "",
    });
  };

  // Execute Checkout
  const handleExecuteCheckout = async () => {
    try {
      setCheckoutLoading(true);
      setError("");

      const addressString = `${selectedAddress.recipientName} (${selectedAddress.phone}) - ${selectedAddress.fullAddress}, ${selectedAddress.city} ${selectedAddress.postalCode}`;

      const payload = {
        shippingAddress: addressString,
        shippingCourier: selectedShipping.name,
        shippingCost,
        serviceFee,
        discountAmount,
        voucherCode: appliedVoucher?.code || null,
        paymentMethod,
        payLaterTenor: paymentCategory === "PAYLATER" ? payLaterTenor : null,
        payLaterMonthly:
          paymentCategory === "PAYLATER" ? getPayLaterMonthly(payLaterTenor) : null,
      };

      const endpoint = directItem
        ? `${API_BASE_URL}/order/direct-checkout`
        : `${API_BASE_URL}/order/checkout`;

      const bodyData = directItem
        ? {
            ...payload,
            productId: directItem.product.id,
            quantity: directItem.quantity || 1,
          }
        : payload;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      let data: any;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        let errorMsg = "Gagal memproses pesanan pembayaran";
        if (Array.isArray(data.message)) {
          errorMsg = data.message.join(", ");
        } else if (typeof data.message === "string") {
          errorMsg = data.message;
        } else if (typeof data.error === "string") {
          errorMsg = data.error;
        }
        throw new Error(errorMsg);
      }

      setConfirmModalOpen(false);
      setCreatedOrder(data);
      setShowPaymentModal(true);
    } catch (err: any) {
      console.error("Checkout submission error:", err);
      const msg =
        typeof err?.message === "string"
          ? err.message
          : typeof err === "string"
          ? err
          : "Terjadi kendala saat memproses checkout";
      setError(msg);
      setConfirmModalOpen(false);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] p-6 sm:p-8 flex items-center justify-center">
        <p className="text-center text-xs sm:text-sm text-slate-500">Memuat rincian pesanan...</p>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] p-6 sm:p-8">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <ShoppingBag size={44} className="mx-auto text-slate-400" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">Tidak ada produk untuk checkout</h2>
          <p className="mt-1 text-xs text-slate-500">
            Keranjang Anda kosong atau pesanan telah diproses.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
          >
            Mulai Belanja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        <Link
          to={directItem ? `/product/${directItem.product.id}` : "/cart"}
          className="mb-6 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition"
        >
          <ArrowLeft size={18} />
          {directItem ? "Kembali ke Produk" : "Kembali ke Keranjang"}
        </Link>

        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-slate-950">
            Pembayaran &amp; Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lengkapi alamat, pilih kurir, dan tentukan metode pembayaran aman Anda.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs sm:text-sm font-semibold text-red-700 shadow-xs">
            <AlertCircle size={20} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: DETAILS & METHODS */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. SHIPPING ADDRESS SECTION */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-slate-900" />
                  <h3 className="text-sm font-bold text-slate-950">Alamat Pengiriman</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="text-xs font-bold text-slate-900 hover:underline cursor-pointer"
                >
                  Ganti / Tambah Alamat
                </button>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-950 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    {selectedAddress.label}
                  </span>
                  <strong className="text-slate-900">{selectedAddress.recipientName}</strong>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">{selectedAddress.phone}</span>
                </div>
                <p className="text-slate-600 leading-relaxed pt-1">
                  {selectedAddress.fullAddress}, {selectedAddress.city} {selectedAddress.postalCode}
                </p>
              </div>
            </div>

            {/* 2. PRODUCTS REVIEW */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShoppingBag size={18} className="text-slate-900" />
                <h3 className="text-sm font-bold text-slate-950">
                  Daftar Barang Belanja ({checkoutItems.length} Produk)
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-3.5 py-3 first:pt-0 last:pb-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                      <img
                        src={
                          item.product.image
                            ? item.product.image.startsWith("http")
                              ? item.product.image
                              : `${API_BASE_URL}/uploads/${item.product.image}`
                            : "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=500&auto=format&fit=crop"
                        }
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.quantity} x {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <p className="text-xs font-black text-slate-950 self-end">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. SHIPPING COURIER SELECTION */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Truck size={18} className="text-slate-900" />
                <h3 className="text-sm font-bold text-slate-950">Pilih Opsi Pengiriman</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SHIPPING_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedShippingId(opt.id)}
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 cursor-pointer transition ${
                      selectedShippingId === opt.id
                        ? "border-slate-950 bg-slate-950/5 shadow-2xs"
                        : "border-slate-200 hover:border-slate-400 bg-white"
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{opt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-950 truncate">{opt.name}</p>
                        {selectedShippingId === opt.id && (
                          <CheckCircle2 size={16} className="text-slate-950 shrink-0 ml-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.etd}</p>
                      <p className="text-xs font-extrabold text-slate-900 mt-1">
                        {formatPrice(opt.cost)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. VOUCHER & PROMO DISCOUNTS */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Ticket size={18} className="text-slate-900" />
                <h3 className="text-sm font-bold text-slate-950">Kupon &amp; Voucher Diskon</h3>
              </div>

              {appliedVoucher ? (
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">{appliedVoucher.title}</p>
                      <p className="text-[11px] text-emerald-700">
                        Kode: <strong className="font-mono">{appliedVoucher.code}</strong> • Hemat{" "}
                        {formatPrice(appliedVoucher.discount)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                      placeholder="Masukkan kode promo (cth: DISKONHEMAT)"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 uppercase font-mono tracking-wide focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyVoucher()}
                      className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                      Terapkan
                    </button>
                  </div>

                  {voucherError && (
                    <p className="text-[11px] font-medium text-red-600">{voucherError}</p>
                  )}

                  {/* REKOMENDASI VOUCHER POPULER */}
                  <div className="pt-2 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500">Pilih Voucher Tersedia:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PROMO_VOUCHERS.map((v) => (
                        <div
                          key={v.code}
                          onClick={() => handleApplyVoucher(v.code)}
                          className="flex items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2.5 hover:border-slate-900 hover:bg-white cursor-pointer transition text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-slate-900">{v.code}</span>
                            <p className="text-[10px] text-slate-500">{v.title}</p>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600">Gunakan</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. PAYMENT METHODS SELECTION */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CreditCard size={18} className="text-slate-900" />
                <h3 className="text-sm font-bold text-slate-950">Pilih Metode Pembayaran</h3>
              </div>

              {/* PAYMENT CATEGORY TABS */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                {[
                  { id: "VA", label: "Virtual Account", icon: <Building2 size={16} /> },
                  { id: "EWALLET", label: "E-Wallet", icon: <Smartphone size={16} /> },
                  { id: "QRIS", label: "QRIS", icon: <QrCode size={16} /> },
                  { id: "CC", label: "Kartu Kredit", icon: <CreditCard size={16} /> },
                  { id: "RETAIL", label: "Gerai Retail", icon: <Store size={16} /> },
                  { id: "PAYLATER", label: "PayLater", icon: <Zap size={16} /> },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setPaymentCategory(cat.id as any);
                      if (cat.id === "VA") setPaymentMethod("BCA_VA");
                      if (cat.id === "EWALLET") setPaymentMethod("GOPAY");
                      if (cat.id === "QRIS") setPaymentMethod("QRIS");
                      if (cat.id === "CC") setPaymentMethod("CREDIT_CARD");
                      if (cat.id === "RETAIL") setPaymentMethod("INDOMARET");
                      if (cat.id === "PAYLATER") setPaymentMethod("SPAYLATER");
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-2.5 transition cursor-pointer ${
                      paymentCategory === cat.id
                        ? "border-slate-950 bg-slate-950 text-white font-bold shadow-2xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat.icon}
                    <span className="text-[10px] leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* CATEGORY SPECIFIC OPTIONS */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                {/* VIRTUAL ACCOUNT OPTIONS */}
                {paymentCategory === "VA" && (
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-slate-900 mb-2">Pilih Bank Virtual Account:</p>
                    {[
                      { id: "BCA_VA", name: "BCA Virtual Account", desc: "Verifikasi Otomatis", logo: <BcaLogo /> },
                      { id: "MANDIRI_VA", name: "Mandiri Virtual Account (Livin')", desc: "Verifikasi Otomatis", logo: <MandiriLogo /> },
                      { id: "BRI_VA", name: "BRI Virtual Account (BRIVA)", desc: "Verifikasi Otomatis", logo: <BriLogo /> },
                      { id: "BNI_VA", name: "BNI Virtual Account", desc: "Verifikasi Otomatis", logo: <BniLogo /> },
                      { id: "PERMATA_VA", name: "Permata Virtual Account", desc: "Verifikasi Otomatis", logo: <PermataLogo /> },
                    ].map((bank) => (
                      <label
                        key={bank.id}
                        className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                          paymentMethod === bank.id
                            ? "border-slate-950 bg-white shadow-2xs font-bold ring-1 ring-slate-950"
                            : "border-slate-200 bg-white/70 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === bank.id}
                            onChange={() => setPaymentMethod(bank.id)}
                            className="text-slate-950 focus:ring-0"
                          />
                          <div>
                            <p className="text-slate-900">{bank.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{bank.desc}</p>
                          </div>
                        </div>
                        {bank.logo}
                      </label>
                    ))}
                  </div>
                )}

                {/* E-WALLET OPTIONS */}
                {paymentCategory === "EWALLET" && (
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-slate-900 mb-2">Pilih E-Wallet:</p>
                    {[
                      { id: "GOPAY", name: "GoPay", desc: "Buka aplikasi Gojek / GoPay", logo: <GopayLogo /> },
                      { id: "OVO", name: "OVO", desc: "Notifikasi tagihan ke nomor ponsel OVO", logo: <OvoLogo /> },
                      { id: "SHOPEEPAY", name: "ShopeePay", desc: "Verifikasi instan via Shopee", logo: <ShopeepayLogo /> },
                      { id: "DANA", name: "DANA", desc: "Saldo DANA Dompet Digital", logo: <DanaLogo /> },
                    ].map((ew) => (
                      <label
                        key={ew.id}
                        className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                          paymentMethod === ew.id
                            ? "border-slate-950 bg-white shadow-2xs font-bold ring-1 ring-slate-950"
                            : "border-slate-200 bg-white/70 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === ew.id}
                            onChange={() => setPaymentMethod(ew.id)}
                            className="text-slate-950 focus:ring-0"
                          />
                          <div>
                            <p className="text-slate-900">{ew.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{ew.desc}</p>
                          </div>
                        </div>
                        {ew.logo}
                      </label>
                    ))}
                  </div>
                )}

                {/* QRIS OPTION */}
                {paymentCategory === "QRIS" && (
                  <div className="text-center p-5 bg-white rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex justify-center">
                      <QrisLogo className="h-14 w-14" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">QRIS Standar Pembayaran Nasional</p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                        Dapat dipindai menggunakan seluruh aplikasi perbankan (BCA, Mandiri, BRI, BNI, dll) dan dompet digital (GoPay, OVO, ShopeePay, DANA, LinkAja).
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                      <BcaLogo className="h-7 w-7 min-w-[28px] rounded-lg" />
                      <MandiriLogo className="h-7 w-7 min-w-[28px] rounded-lg" />
                      <BriLogo className="h-7 w-7 min-w-[28px] rounded-lg" />
                      <GopayLogo className="h-7 w-7 min-w-[28px] rounded-lg" />
                      <OvoLogo className="h-7 w-7 min-w-[28px] rounded-lg" />
                      <DanaLogo className="h-7 w-7 min-w-[28px] rounded-lg" />
                      <ShopeepayLogo className="h-7 w-7 min-w-[28px] rounded-lg" />
                    </div>
                  </div>
                )}

                {/* CREDIT CARD OPTIONS */}
                {paymentCategory === "CC" && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">Kartu Debit / Kredit</p>
                        <div className="flex items-center gap-1.5">
                          <VisaLogo className="h-7 w-7 min-w-[28px] rounded-lg" />
                          <MastercardLogo className="h-7 w-7 min-w-[28px] rounded-lg" />
                          <JcbLogo className="h-7 w-7 min-w-[28px] rounded-lg" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        <Lock size={11} />
                        <span>3D Secure SSL 256-bit</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Nomor Kartu (16 Digit)
                        </label>
                        <input
                          type="text"
                          maxLength={19}
                          value={ccNumber}
                          onChange={(e) => setCcNumber(e.target.value)}
                          placeholder="4000 1234 5678 9010"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono tracking-wider"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Masa Berlaku (MM/YY)
                          </label>
                          <input
                            type="text"
                            maxLength={5}
                            value={ccExpiry}
                            onChange={(e) => setCcExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            CVV (3 Digit Rahasia)
                          </label>
                          <input
                            type="password"
                            maxLength={3}
                            value={ccCvv}
                            onChange={(e) => setCcCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* RETAIL OPTIONS */}
                {paymentCategory === "RETAIL" && (
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-slate-900 mb-2">Pilih Gerai Retail:</p>
                    {[
                      { id: "INDOMARET", name: "Indomaret / Ceriamart", desc: "Tunjukkan kode bayar ke kasir", logo: <IndomaretLogo /> },
                      { id: "ALFAMART", name: "Alfamart / Alfamidi / Dan+Dan", desc: "Tunjukkan kode bayar ke kasir", logo: <AlfamartLogo /> },
                    ].map((rt) => (
                      <label
                        key={rt.id}
                        className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                          paymentMethod === rt.id
                            ? "border-slate-950 bg-white shadow-2xs font-bold ring-1 ring-slate-950"
                            : "border-slate-200 bg-white/70 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === rt.id}
                            onChange={() => setPaymentMethod(rt.id)}
                            className="text-slate-950 focus:ring-0"
                          />
                          <div>
                            <p className="text-slate-900">{rt.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{rt.desc}</p>
                          </div>
                        </div>
                        {rt.logo}
                      </label>
                    ))}
                  </div>
                )}

                {/* PAYLATER OJK OPTIONS */}
                {paymentCategory === "PAYLATER" && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">Pilih Layanan PayLater Berizin OJK:</p>
                      <span className="rounded-full bg-blue-100 border border-blue-200 px-2.5 py-0.5 text-[9px] font-black text-blue-800 uppercase">
                        Terdaftar &amp; Diawasi OJK
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: "SPAYLATER", name: "SPayLater", logo: <SpaylaterLogo /> },
                        { id: "KREDIVO", name: "Kredivo PayLater", logo: <KredivoLogo /> },
                      ].map((pl) => (
                        <label
                          key={pl.id}
                          className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                            paymentMethod === pl.id
                              ? "border-slate-950 bg-white shadow-2xs font-bold ring-1 ring-slate-950"
                              : "border-slate-200 bg-white/70 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === pl.id}
                              onChange={() => setPaymentMethod(pl.id)}
                              className="text-slate-950 focus:ring-0"
                            />
                            <span className="text-slate-900 font-semibold">{pl.name}</span>
                          </div>
                          {pl.logo}
                        </label>
                      ))}
                    </div>

                    {/* TENOR SELECTION */}
                    <div className="pt-2 space-y-2">
                      <p className="font-bold text-slate-800 text-[11px]">Pilih Skema Cicilan / Tenor:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { t: 1, label: "Beli Sekarang, Bayar Nanti (30 Hari)", feeDesc: "Bunga 0%" },
                          { t: 3, label: "Cicilan 3 Bulan", feeDesc: "Bunga 1.5%/bln" },
                          { t: 6, label: "Cicilan 6 Bulan", feeDesc: "Bunga 2.0%/bln" },
                          { t: 12, label: "Cicilan 12 Bulan", feeDesc: "Bunga 2.5%/bln" },
                        ].map((tenor) => {
                          const monthly = getPayLaterMonthly(tenor.t);
                          return (
                            <div
                              key={tenor.t}
                              onClick={() => setPayLaterTenor(tenor.t)}
                              className={`rounded-xl border p-2.5 text-center cursor-pointer transition ${
                                payLaterTenor === tenor.t
                                  ? "border-blue-600 bg-blue-50/80 text-blue-950 font-bold shadow-2xs"
                                  : "border-slate-200 bg-white hover:bg-slate-100"
                              }`}
                            >
                              <p className="text-xs">{tenor.t === 1 ? "1x Bayar" : `${tenor.t}x Bulan`}</p>
                              <p className="text-[10px] text-slate-500 font-normal">{tenor.feeDesc}</p>
                              <p className="text-[11px] font-black text-slate-950 mt-1">
                                {formatPrice(monthly)}/bln
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                      * Layanan pembiayaan cicilan diselenggarakan oleh mitra lembaga jasa keuangan berizin dan diawasi oleh Otoritas Jasa Keuangan (OJK).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 6. PANDUAN & LANGKAH-LANGKAH PEMBAYARAN */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-slate-900" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">
                      Langkah Pembayaran: {getMethodReadableName(paymentMethod)}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Panduan resmi untuk menyelesaikan transaksi Anda
                    </p>
                  </div>
                </div>

                {/* Sub-channel tabs for Virtual Accounts */}
                {paymentCategory === "VA" && ["BCA_VA", "MANDIRI_VA", "BRI_VA"].includes(paymentMethod) && (
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setGuideSubTab("mbanking")}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        guideSubTab === "mbanking"
                          ? "bg-white text-slate-950 shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      m-Banking
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuideSubTab("atm")}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        guideSubTab === "atm"
                          ? "bg-white text-slate-950 shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      ATM
                    </button>
                    {paymentMethod === "BCA_VA" && (
                      <button
                        type="button"
                        onClick={() => setGuideSubTab("ibanking")}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          guideSubTab === "ibanking"
                            ? "bg-white text-slate-950 shadow-2xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        KlikBCA
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* STEP LIST */}
              <div className="space-y-3">
                {getPaymentGuideSteps(paymentMethod, guideSubTab).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs transition hover:bg-slate-100/70"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white font-black text-[11px] shadow-2xs">
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 text-xs">{item.title}</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* SECURITY / ASSISTANCE FOOTNOTE */}
              <div className="flex items-center gap-2 rounded-2xl bg-blue-50/80 border border-blue-200/80 p-3 text-[11px] text-blue-900">
                <Info size={16} className="text-blue-600 shrink-0" />
                <span>
                  Nomor Virtual Account, QRIS, atau Kode Kasir resmi akan langsung diterbitkan setelah Anda menekan tombol <strong>Bayar Sekarang</strong>.
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FINANCIAL SUMMARY */}
          <div className="space-y-6">
            <div className="sticky top-6 rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-950 border-b border-slate-100 pb-3">
                Ringkasan Transaksi
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total Harga Produk</span>
                  <span className="font-semibold text-slate-950">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Total Ongkos Kirim</span>
                  <span className="font-semibold text-slate-950">{formatPrice(shippingCost)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <span>Biaya Layanan &amp; Keamanan</span>
                    <HelpCircle size={12} className="text-slate-400" />
                  </span>
                  <span className="font-semibold text-slate-950">{formatPrice(serviceFee)}</span>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Potongan Voucher ({appliedVoucher.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-3 flex justify-between text-sm sm:text-base font-black text-slate-950">
                  <span>Total Pembayaran</span>
                  <span className="text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* SECURITY ASSURANCE */}
              <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-3 text-[11px] text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  <span>Jaminan Transaksi Aman E-Shop</span>
                </p>
                <p className="text-[10px] text-emerald-800 leading-relaxed">
                  Dana Anda dipegang oleh sistem rekening bersama dan baru diteruskan ke penjual setelah pesanan Anda terima.
                </p>
              </div>

              {/* ACTION CHECKOUT BUTTON */}
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                disabled={checkoutLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-xs sm:text-sm font-black text-white shadow-md hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                <Zap size={16} className="text-amber-400 fill-amber-400" />
                <span>Bayar Sekarang ({formatPrice(grandTotal)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD / EDIT ADDRESS */}
      {showAddressModal && (
        <div
          onClick={() => setShowAddressModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950">Pilih / Tambah Alamat</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* LIST EXISTING ADDRESSES */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-600">Alamat Tersimpan:</p>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => {
                    setSelectedAddressId(addr.id);
                    setShowAddressModal(false);
                  }}
                  className={`rounded-2xl border p-3 cursor-pointer text-xs transition ${
                    selectedAddressId === addr.id
                      ? "border-slate-950 bg-slate-50 font-bold"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
                      {addr.label}
                    </span>
                    {selectedAddressId === addr.id && (
                      <Check size={14} className="text-slate-950 font-bold" />
                    )}
                  </div>
                  <p className="font-bold text-slate-900 mt-1">
                    {addr.recipientName} ({addr.phone})
                  </p>
                  <p className="text-slate-600 font-normal mt-0.5">
                    {addr.fullAddress}, {addr.city} {addr.postalCode}
                  </p>
                </div>
              ))}
            </div>

            {/* FORM NEW ADDRESS */}
            <form onSubmit={handleAddAddress} className="border-t border-slate-100 pt-4 space-y-3 text-xs">
              <p className="font-bold text-slate-900">Tambah Alamat Baru:</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Label (cth: Apartemen)"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="rounded-xl border border-slate-200 p-2 text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Nama Penerima"
                  value={newAddress.recipientName}
                  onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                  className="rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>
              <input
                type="text"
                required
                placeholder="No. Telepon / WhatsApp"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs"
              />
              <textarea
                required
                rows={2}
                placeholder="Alamat Lengkap (Nama Jalan, No. Rumah, RT/RW, Patokan)"
                value={newAddress.fullAddress}
                onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Kota / Kabupaten"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="rounded-xl border border-slate-200 p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Kode Pos"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                  className="rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                Simpan &amp; Gunakan Alamat Ini
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION BEFORE PAYMENT */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Konfirmasi Pembayaran Pesanan"
        message={`Apakah rincian alamat pengiriman dan metode pembayaran sudah sesuai? Total tagihan pesanan Anda adalah ${formatPrice(
          grandTotal,
        )}.`}
        confirmText="Ya, Lanjutkan Pembayaran"
        cancelText="Periksa Lagi"
        confirmVariant="primary"
        loading={checkoutLoading}
        onConfirm={handleExecuteCheckout}
        onCancel={() => setConfirmModalOpen(false)}
      />

      {/* PAYMENT INSTRUCTIONS & VERIFICATION GATEWAY MODAL */}
      <PaymentInstructionsModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          if (createdOrder) {
            navigate(`/order/${createdOrder.id}`);
          }
        }}
        order={createdOrder}
        onPaymentSuccess={() => {
          if (createdOrder) {
            navigate(`/order/${createdOrder.id}`);
          }
        }}
      />
    </div>
  );
}

export default Checkout;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/customer/Home";
import ProductDetail from "./pages/customer/ProductDetail";
import Store from "./pages/customer/Store";
import Cart from "./pages/customer/Cart";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SecuritySettings from "./pages/customer/SecuritySettings";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Categories from "./pages/admin/Categories";
import Products from "./pages/admin/Products";
import AdminUsers from "./pages/admin/Users";
import AdminSellers from "./pages/admin/Sellers";
import AdminOrders from "./pages/admin/Orders";
import AdminReviews from "./pages/admin/Reviews";
import AdminFinance from "./pages/admin/Finance";
import AdminSettings from "./pages/admin/Settings";
import AdminSupport from "./pages/admin/Support";

import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/Products";
import SellerOrders from "./pages/seller/Orders";
import SellerReviews from "./pages/seller/Reviews";
import SellerSales from "./pages/seller/Sales";
import SellerProfile from "./pages/seller/Profile";

import Checkout from "./pages/customer/Checkout";
import OrderDetail from "./pages/customer/OrderDetail";
import Orders from "./pages/customer/Orders";
import Wishlist from "./pages/customer/Wishlist";
import CustomerSupport from "./pages/customer/Support";
import GuestModal from "./components/GuestModal";
import { isGuestUser } from "./lib/auth";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  categoryId?: string;
  sellerId?: string;
  category?: {
    name: string;
  };
  seller?: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface TokenPayload {
  role: "ADMIN" | "SELLER" | "CUSTOMER";
}

// Role-specific protected route (e.g. /admin only for ADMIN, /seller only for SELLER)
function ProtectedRoute({
  role,
  children,
}: {
  role: "ADMIN" | "SELLER";
  children: React.ReactNode;
}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);

    if (decoded.role !== role) {
      if (decoded.role === "ADMIN") {
        return <Navigate to="/admin" replace />;
      }
      if (decoded.role === "SELLER") {
        return <Navigate to="/seller" replace />;
      }
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  }
}

// Buyer route accessible by ALL authenticated users (CUSTOMER, SELLER, ADMIN)
function BuyerRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [hasWishlist, setHasWishlist] = useState(false);

  // Global Guest Modal
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestModalMessage, setGuestModalMessage] = useState("");

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setCartCount(0);
        return;
      }

      const response = await fetch("http://localhost:3000/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setCartCount(0);
        return;
      }

      const data = await response.json();

      const totalItems = data.reduce(
        (total: number, item: { quantity: number }) => total + item.quantity,
        0,
      );

      setCartCount(totalItems);
    } catch (error) {
      console.error("Cart count error:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setHasWishlist(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/wishlist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setHasWishlist(false);
          return;
        }

        const data = await response.json();
        setHasWishlist(data.length > 0);
      } catch (error) {
        console.error("Wishlist count error:", error);
        setHasWishlist(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleAddToCart = async (productId: string, quantity: number) => {
    if (isGuestUser()) {
      setGuestModalMessage("Silakan Login atau Register terlebih dahulu untuk menambahkan produk ke keranjang belanja.");
      setGuestModalOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menambahkan ke keranjang");
      }

      await fetchCartCount();
      alert("Produk berhasil ditambahkan ke keranjang");
    } catch (error: any) {
      console.error("Add to cart error:", error);
      alert(error.message || "Gagal menambahkan produk");
    }
  };

  return (
    <BrowserRouter>
      {/* GLOBAL GUEST PROTECTION MODAL */}
      <GuestModal
        isOpen={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        message={guestModalMessage}
      />

      <Routes>
        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute role="ADMIN">
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute role="ADMIN">
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sellers"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminSellers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/finance"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminFinance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminSupport />
            </ProtectedRoute>
          }
        />

        {/* SELLER ROUTES */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute role="SELLER">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <ProtectedRoute role="SELLER">
              <SellerProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute role="SELLER">
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/reviews"
          element={
            <ProtectedRoute role="SELLER">
              <SellerReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/sales"
          element={
            <ProtectedRoute role="SELLER">
              <SellerSales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/profile"
          element={
            <ProtectedRoute role="SELLER">
              <SellerProfile />
            </ProtectedRoute>
          }
        />

        {/* BUYER ROUTES */}
        <Route
          path="/cart"
          element={
            <BuyerRoute>
              <Cart onCartChange={fetchCartCount} />
            </BuyerRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <BuyerRoute>
              <Checkout />
            </BuyerRoute>
          }
        />
        <Route
          path="/order/:id"
          element={
            <BuyerRoute>
              <OrderDetail />
            </BuyerRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <BuyerRoute>
              <Orders />
            </BuyerRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <BuyerRoute>
              <Wishlist />
            </BuyerRoute>
          }
        />
        <Route
          path="/support"
          element={
            <BuyerRoute>
              <CustomerSupport />
            </BuyerRoute>
          }
        />
        <Route
          path="/security"
          element={
            <BuyerRoute>
              <SecuritySettings />
            </BuyerRoute>
          }
        />

        {/* STORE PAGE (PUBLIC TO ALL GUESTS / BUYERS) */}
        <Route
          path="/store/:sellerId"
          element={
            <>
              <Navbar cartCount={cartCount} hasWishlist={hasWishlist} />
              <Store
                onAddToCart={handleAddToCart}
                onProductClick={(product) => setSelectedProduct(product)}
              />
              <Footer />
            </>
          }
        />

        {/* HOME / MARKETPLACE PAGE */}
        <Route
          path="/"
          element={
            <>
              <Navbar cartCount={cartCount} hasWishlist={hasWishlist} />

              {selectedProduct ? (
                <ProductDetail
                  product={selectedProduct}
                  onBack={() => setSelectedProduct(null)}
                  onAddToCart={handleAddToCart}
                  onWishlistChange={setHasWishlist}
                />
              ) : (
                <Home
                  onProductClick={(product) => {
                    setSelectedProduct(product);
                  }}
                  onWishlistChange={setHasWishlist}
                  onAddToCart={handleAddToCart}
                />
              )}

              <Footer />
            </>
          }
        />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
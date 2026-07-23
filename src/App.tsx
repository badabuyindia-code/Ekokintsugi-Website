/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ImpactDashboard from "./components/ImpactDashboard";
import ScrollToTop from "./components/ScrollToTop";

import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";
import ProductCategoryPage from "./pages/ProductCategoryPage";
import ProcessPage from "./pages/ProcessPage";
import ImpactPage from "./pages/ImpactPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import { CartProvider } from "./lib/CartContext";
import CartDrawer from "./components/CartDrawer";
import ProductDetailPage from "./pages/ProductDetailPage";
import AccountPage from "./pages/AccountPage";

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const isImpactOpen = searchParams.get("impact") === "open";

  const openImpactDashboard = () => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set("impact", "open");

    navigate(
      {
        pathname: location.pathname,
        search: `?${nextParams.toString()}`
      },
      { replace: false }
    );
  };

  const closeImpactDashboard = () => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.delete("impact");

    navigate(
      {
        pathname: location.pathname,
        search: nextParams.toString() ? `?${nextParams.toString()}` : ""
      },
      { replace: false }
    );
  };

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen surface-gradient text-foreground selection:bg-accent selection:text-accent-foreground flex flex-col">
        <Navbar onImpactClick={openImpactDashboard} />

        <main className="pt-20 flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/category/:slug" element={<ProductCategoryPage />} />
            <Route path="/process" element={<ProcessPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/products/item/:id" element={<ProductDetailPage />} />
          </Routes>
        </main>

        <Footer />
        <ImpactDashboard isOpen={isImpactOpen} onClose={closeImpactDashboard} />
        <CartDrawer />
      </div>
    </>
  );
}

import { LanguageProvider } from "./lib/LanguageContext";

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </LanguageProvider>
    </Router>
  );
}

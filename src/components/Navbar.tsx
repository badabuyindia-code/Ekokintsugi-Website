import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../lib/ThemeContext";
import { LogOut, Moon, Sun, UserRound, ShoppingBag, Menu, X } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { useCart } from "../lib/CartContext";
import { useLanguage } from "../lib/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export default function Navbar({ onImpactClick }: { onImpactClick: () => void }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { totalItems, setCartOpen } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: t("nav.home"), path: '/' },
    { name: t("nav.about"), path: '/about' },
    { name: t("nav.products"), path: '/products' },
    { name: t("nav.process"), path: '/process' },
    { name: t("nav.impact"), path: '/impact' },
    { name: t("nav.contact"), path: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 navbar-premium">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex justify-between items-center relative">
        {/* Left Side: Brand Logo (Fully visible and uncrowded on mobile) */}
        <Link to="/" className="flex items-center group z-50">
          <span className="logo-surface transition-transform duration-500 group-hover:scale-[1.02]">
            <img src="/logo_eko.png" alt="EkoKintsugi Logo" className="h-10 sm:h-14 w-auto logo-image-premium" />
          </span>
        </Link>

        {/* Center: Minimalist Nav Links (Desktop only) */}
        <nav className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => {
            const isActive = link.path === "/products"
              ? location.pathname === "/products" || location.pathname.startsWith("/products/")
              : location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className="text-[9px] font-mono tracking-[0.25em] uppercase transition-all duration-300 py-1 text-primary/80 hover:text-accent font-bold relative group/link nav-link-premium"
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover/link:w-full ${isActive ? 'w-full' : ''}`} />
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Control Panel */}
        <div className="flex items-center gap-3 z-50">
          {/* Integrated Preferences Control Pill (Theme + Language) - Desktop only */}
          <div className="hidden lg:flex items-center rounded-full px-1.5 py-1 gap-1 transition-all pref-pill-premium">
            {/* Language Toggler */}
            <button
              onClick={() => setLanguage(language === "en" ? "de" : "en")}
              className="px-2 py-1 rounded-full text-[9px] font-mono tracking-wider font-bold transition-colors cursor-pointer"
              title={language === "en" ? "Switch to German" : "Auf Englisch wechseln"}
            >
              <span className={language === "en" ? "text-accent" : ""}>EN</span>
              <span className="text-border/30 text-[8px] mx-1 font-light">|</span>
              <span className={language === "de" ? "text-accent" : ""}>DE</span>
            </button>
            
            <div className="w-px h-3 bg-border/40" />
            
            {/* Theme Toggler */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-full transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
            </button>
          </div>

          {/* Cart Button (Visible on both Mobile and Desktop for easy checkouts) */}
          {user && (
            <button
              onClick={() => setCartOpen(true)}
              className="p-2 rounded-full relative cursor-pointer group btn-premium"
              title="Open cart"
            >
              <ShoppingBag size={14} className="transition-transform duration-300 group-hover:scale-105" />
              {totalItems > 0 && (
                <motion.span
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-[8px] font-mono font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-background shadow-sm"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
          )}

          {/* Compact 'My Impact' Action Button - Desktop only */}
          <button 
            onClick={onImpactClick}
            className="hidden lg:flex items-center gap-1.5 text-[9px] font-mono tracking-widest uppercase font-bold px-4 py-2.5 rounded-full cursor-pointer hover:scale-[1.01] transition-all impact-btn-premium"
          >
            {t("nav.my_impact")}
          </button>

          {/* User Account / Authentication Buttons - Desktop only */}
          {user ? (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/account"
                className="p-2 rounded-full cursor-pointer btn-premium"
                title={t("nav.view_account")}
              >
                <UserRound size={14} />
              </Link>
              <button
                onClick={signOut}
                className="p-2 rounded-full cursor-pointer btn-premium"
                title={t("nav.sign_out")}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden lg:flex px-5 py-2.5 rounded-full text-[9px] font-mono tracking-widest uppercase font-bold hover:scale-[1.01] transition-all signin-btn-premium"
            >
              {t("nav.sign_in")}
            </Link>
          )}

          {/* Mobile Hamburger Toggle Menu Button (Mobile/Tablet only) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex lg:hidden p-2 rounded-full cursor-pointer btn-premium text-primary hover:text-accent transition-colors duration-300"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Premium Mobile Glassmorphic Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-[105%] left-4 right-4 p-6 rounded-[2rem] border border-primary-foreground/10 bg-background/95 backdrop-blur-xl shadow-strong flex flex-col gap-6 lg:hidden z-40 text-left"
            >
              {/* Navigation Links */}
              <div className="flex flex-col gap-4 border-b border-border pb-4">
                {navLinks.map((link) => {
                  const isActive = link.path === "/products"
                    ? location.pathname === "/products" || location.pathname.startsWith("/products/")
                    : location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`text-xs font-mono tracking-[0.2em] uppercase font-bold transition-all py-1.5 ${isActive ? "text-accent" : "text-primary/80 hover:text-accent"}`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              {/* Theme and Language Selection */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-black">Preferences</span>
                <div className="flex items-center rounded-full px-2 py-0.5 gap-1 transition-all pref-pill-premium">
                  <button
                    onClick={() => setLanguage(language === "en" ? "de" : "en")}
                    className="px-2 py-1 rounded-full text-[9px] font-mono tracking-wider font-bold transition-colors cursor-pointer"
                  >
                    <span className={language === "en" ? "text-accent" : ""}>EN</span>
                    <span className="text-border/30 text-[8px] mx-1">|</span>
                    <span className={language === "de" ? "text-accent" : ""}>DE</span>
                  </button>
                  
                  <div className="w-px h-3 bg-border/40" />
                  
                  <button
                    onClick={toggleTheme}
                    className="p-1 rounded-full cursor-pointer text-primary"
                  >
                    {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {/* My Impact Action */}
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    onImpactClick();
                  }}
                  className="flex items-center justify-center gap-1.5 text-[9px] font-mono tracking-widest uppercase font-bold px-4 py-3 rounded-full cursor-pointer w-full impact-btn-premium"
                >
                  {t("nav.my_impact")}
                </button>

                {/* Account Actions */}
                {user ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/account"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-full border border-primary/15 px-4 py-3 font-mono text-[9px] tracking-widest uppercase font-bold text-primary hover:bg-primary/5 transition-all text-center w-full"
                    >
                      <UserRound size={12} />
                      <span>{t("nav.view_account")}</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        signOut();
                      }}
                      className="flex items-center justify-center gap-2 rounded-full border border-red-200/20 px-4 py-3 font-mono text-[9px] tracking-widest uppercase font-bold text-red-600 hover:bg-red-500/5 transition-all text-center w-full cursor-pointer"
                    >
                      <LogOut size={12} />
                      <span>{t("nav.sign_out")}</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center px-5 py-3 rounded-full text-[9px] font-mono tracking-widest uppercase font-bold signin-btn-premium text-center"
                  >
                    {t("nav.sign_in")}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

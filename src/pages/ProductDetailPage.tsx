import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight, ShieldCheck, TreePine, Leaf, Sparkles, ShoppingBag, UserRound } from "lucide-react";
import { useProductsCatalog } from "../hooks/useProductsCatalog";
import { useCart } from "../lib/CartContext";
import { useAuth } from "../lib/AuthContext";
import { useLanguage } from "../lib/LanguageContext";
import ProductCatalogueGrid from "../components/ProductCatalogueGrid";

const getSizesForCategory = (category = "") => {
  const cat = category.toLowerCase();
  if (cat.includes("men's footwear") || cat.includes("mens footwear")) {
    return ["40", "41", "42", "43", "44", "45", "46", "47"];
  }
  if (cat.includes("women's footwear") || cat.includes("womens footwear")) {
    return ["35", "36", "37", "38", "39", "40"];
  }
  if (cat.includes("jackets")) {
    return ["S", "M", "L", "XL"];
  }
  if (cat.includes("laptop bags")) {
    return ["13-inch", "14-inch", "15-inch", "16-inch"];
  }
  if (cat.includes("belts")) {
    return ["32", "34", "36", "38", "40"];
  }
  return ["One Size"];
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, isLoading, error } = useProductsCatalog();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();

  const product = products.find((p) => String(p.id) === String(id));

  // Determine circular sourcing details based on name/category
  const getSourcingDetails = (category = "") => {
    const cat = category.toLowerCase();
    if (cat.includes("footwear") || cat.includes("flat") || cat.includes("sneaker")) {
      return t("detailpage.sourcing.footwear");
    }
    if (cat.includes("backpack") || cat.includes("bag")) {
      return t("detailpage.sourcing.bags");
    }
    return t("detailpage.sourcing.accessories");
  };

  const availableSizes = product && (product.sizes && product.sizes.length > 0 ? product.sizes : getSizesForCategory(product.category));
  const [selectedSize, setSelectedSize] = useState(availableSizes ? (availableSizes[0] || "One Size") : "One Size");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/10 flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-muted/10 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-card border border-border/60 rounded-[2.5rem] p-10 md:p-14 shadow-soft text-center">
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-accent font-bold mb-4">
              {t("detailpage.unavailable_eyebrow")}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-primary font-bold mb-5">{t("detailpage.unavailable_title")}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("detailpage.unavailable_desc")}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground px-7 py-3 text-[11px] font-mono tracking-[0.3em] uppercase font-bold hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("categorypage.back_btn")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Related products (same category, different id)
  const relatedProducts = products
    .filter((p) => p.category === product.category && String(p.id) !== String(id))
    .slice(0, 4);

  const co2Val = product.co2_factor ? parseFloat(String(product.co2_factor)) : 0;
  const wasteVal = product.waste_factor ? parseFloat(String(product.waste_factor)) : 0;

  return (
    <div className="py-10 sm:py-20 min-h-screen bg-muted/10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-10 flex flex-wrap items-center gap-3 text-[10px] font-mono tracking-[0.35em] uppercase text-left">
          <Link to="/products" className="text-muted-foreground hover:text-accent transition-colors">
            {t("nav.products")}
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{product.category || t("detailpage.circular_collection")}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-accent font-bold truncate max-w-48">{product.name}</span>
        </div>

        {/* Product Split Grid */}
        <section className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-16 items-start mb-16 md:mb-24">
          {/* Left Column: Image with Spring Zooms */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="bg-card border border-border/50 rounded-3xl sm:rounded-[2.55rem] overflow-hidden shadow-soft group hover:border-accent/30 transition-colors"
          >
            <div className="aspect-square bg-muted overflow-hidden relative">
              <motion.img
                src={product.image_url || product.image || "/logo_eko.png"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Right Column: details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.1 }}
            className="flex flex-col space-y-6 sm:space-y-8 text-left"
          >
            <div>
              <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-accent font-black block mb-3">
                {product.category || t("detailpage.circular_collection")}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-primary font-bold mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground italic leading-relaxed">
                {product.description || product.desc || "A masterpiece of circular utility and traceable craftsmanship."}
              </p>
            </div>

            {/* Circular Sourcing Breakdown */}
            <div className="bg-card border border-border/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm flex gap-4">
              <ShieldCheck className="w-6 h-6 text-accent shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-mono tracking-widest text-primary font-bold uppercase mb-2">
                  {t("detailpage.sourcing_title")}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {getSourcingDetails(product.category)}
                </p>
              </div>
            </div>

            {/* Circular Impact Panels */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-muted/30 border border-border/50 p-4 sm:p-5 rounded-2xl flex items-center gap-4">
                <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-accent shrink-0" />
                <div>
                  <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">{t("dashboard.stat.co2")}</p>
                  <p className="text-lg sm:text-xl font-serif font-bold text-primary">{co2Val.toFixed(1)} kg</p>
                </div>
              </div>
              <div className="bg-muted/30 border border-border/50 p-4 sm:p-5 rounded-2xl flex items-center gap-4">
                <TreePine className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" />
                <div>
                  <p className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">{t("impactpage.metrics.waste").split(" ")[0]}</p>
                  <p className="text-lg sm:text-xl font-serif font-bold text-primary">{wasteVal.toFixed(1)} kg</p>
                </div>
              </div>
            </div>

            {/* Sizing Selection Grid */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-muted-foreground font-black">
                  Select Circular Size
                </span>
                <span className="text-[10px] font-mono text-accent font-bold">
                  Active: {selectedSize}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {availableSizes && availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`h-11 rounded-xl font-mono text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer border flex items-center justify-center font-bold ${
                      selectedSize === sz
                        ? "bg-accent border-accent text-accent-foreground shadow-md scale-102"
                        : "bg-card border-border hover:border-accent/40 text-primary hover:bg-muted/15"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart CTA */}
            <div className="pt-4 border-t border-border/50 space-y-4">
              {user ? (
                <motion.button
                  onClick={() => addToCart(product, 1, selectedSize)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-full flex items-center justify-center gap-3 rounded-full bg-accent text-accent-foreground px-8 py-4 font-mono text-[10px] tracking-widest uppercase font-black hover:bg-primary hover:text-primary-foreground transition-all shadow-md cursor-pointer group"
                >
                  <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {t("detailpage.add_to_cart")}
                </motion.button>
              ) : (
                <Link
                  to="/auth"
                  className="w-full flex items-center justify-center gap-3 rounded-full bg-primary text-primary-foreground px-8 py-4 font-mono text-[10px] tracking-widest uppercase font-black hover:bg-accent hover:text-accent-foreground transition-all shadow-md cursor-pointer group"
                >
                  <UserRound className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {t("detailpage.sign_in_cart")}
                </Link>
              )}
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-mono">
                <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                <span>{t("detailpage.supports_restoration")}</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Related Products Recommendation */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-border/50 pt-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-accent font-bold mb-3">
                  {t("detailpage.recommendations")}
                </p>
                <h2 className="text-3xl font-serif font-bold text-primary">{t("detailpage.related_designs")}</h2>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-3 text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground hover:text-accent transition-colors font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("detailpage.explore_all")}
              </Link>
            </div>

            <ProductCatalogueGrid
              products={relatedProducts}
              isLoading={false}
              error={null}
              emptyMessage="No related designs available."
            />
          </section>
        )}
      </div>
    </div>
  );
}

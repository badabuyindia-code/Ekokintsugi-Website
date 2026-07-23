import { ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { Link, useParams } from "react-router-dom";
import ProductCatalogueGrid from "../components/ProductCatalogueGrid";
import { useProductsCatalog } from "../hooks/useProductsCatalog";
import { useLanguage } from "../lib/LanguageContext";
import { getCategoryBySlug, getProductsForCategory, PRODUCT_CATEGORIES } from "../lib/productCatalog";

export default function ProductCategoryPage() {
  const { slug } = useParams();
  const rawCategory = getCategoryBySlug(slug);
  const { products, isLoading, error } = useProductsCatalog();
  const { t } = useLanguage();

  const getLocalizedCategory = (category: any) => {
    if (!category) return null;
    switch (category.slug) {
      case "belts":
        return {
          ...category,
          title: t("category.belts.title"),
          shortTitle: t("category.belts.short"),
          eyebrow: t("category.belts.eyebrow"),
          description: t("category.belts.desc")
        };
      case "accessories":
        return {
          ...category,
          title: t("category.accessories.title"),
          shortTitle: t("category.accessories.short"),
          eyebrow: t("category.accessories.eyebrow"),
          description: t("category.accessories.desc")
        };
      case "handbag-collections":
        return {
          ...category,
          title: t("category.handbags.title"),
          shortTitle: t("category.handbags.short"),
          eyebrow: t("category.handbags.eyebrow"),
          description: t("category.handbags.desc")
        };
      case "jackets":
        return {
          ...category,
          title: t("category.jackets.title"),
          shortTitle: t("category.jackets.short"),
          eyebrow: t("category.jackets.eyebrow"),
          description: t("category.jackets.desc")
        };

      case "laptop-bags":
        return {
          ...category,
          title: t("category.laptopbags.title"),
          shortTitle: t("category.laptopbags.short"),
          eyebrow: t("category.laptopbags.eyebrow"),
          description: t("category.laptopbags.desc")
        };
      case "mens-footwear":
        return {
          ...category,
          title: t("category.mens.title"),
          shortTitle: t("category.mens.short"),
          eyebrow: t("category.mens.eyebrow"),
          description: t("category.mens.desc")
        };
      case "wallets":
        return {
          ...category,
          title: t("category.wallets.title"),
          shortTitle: t("category.wallets.short"),
          eyebrow: t("category.wallets.eyebrow"),
          description: t("category.wallets.desc")
        };
      case "womens-footwear":
        return {
          ...category,
          title: t("category.womens.title"),
          shortTitle: t("category.womens.short"),
          eyebrow: t("category.womens.eyebrow"),
          description: t("category.womens.desc")
        };
      default:
        return category;
    }
  };

  const category = getLocalizedCategory(rawCategory);
  const filteredProducts = rawCategory ? getProductsForCategory(products, rawCategory) : [];

  if (!category) {
    return (
      <div className="py-20 min-h-screen bg-muted/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-card border border-border/60 rounded-[2.5rem] p-10 md:p-14 shadow-soft text-center">
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-accent font-bold mb-4">
              {t("categorypage.not_found_eyebrow")}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-primary font-bold mb-5">{t("categorypage.not_found_title")}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("categorypage.not_found_desc")}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground px-7 py-3 text-[11px] font-mono tracking-[0.3em] uppercase font-bold hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("categorypage.back_btn")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 min-h-screen bg-muted/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-[10px] font-mono tracking-[0.35em] uppercase">
          <Link to="/products" className="text-muted-foreground hover:text-accent transition-colors">
            {t("nav.products")}
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-accent font-bold">{category.shortTitle}</span>
        </div>

        <section className="bg-card border border-border/50 rounded-[2rem] sm:rounded-[2.75rem] overflow-hidden shadow-soft mb-16">
          <div className="grid lg:grid-cols-[1.15fr_1fr] items-stretch">
            <div className="relative min-h-[16rem] sm:min-h-[22rem] lg:min-h-[28rem]">
              <img
                src={category.image}
                alt={category.shortTitle}
                className="w-full h-full object-cover"
                style={{ objectPosition: category.imagePosition ?? "center" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-primary/80 via-primary/35 to-transparent" />
            </div>

            <div className="p-6 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-center">
              <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-accent font-bold mb-3 sm:mb-4">
                {category.eyebrow}
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-primary font-bold mb-4 sm:mb-6">{category.title}</h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8">{category.description}</p>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {PRODUCT_CATEGORIES.map((itemRaw) => {
                  const item = getLocalizedCategory(itemRaw);
                  if (!item) return null;
                  const isActive = item.slug === category.slug;
                  return (
                    <motion.div
                      key={item.slug}
                      whileHover={{ y: -3, scale: 1.04 }}
                      transition={{ type: "spring", stiffness: 450, damping: 20 }}
                    >
                      <Link
                        to={`/products/category/${item.slug}`}
                        className={`rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-[9px] sm:text-[10px] font-mono tracking-[0.28em] uppercase font-bold transition-all duration-300 block ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "border border-border text-muted-foreground hover:border-accent hover:text-accent bg-card"
                        }`}
                      >
                        {item.shortTitle}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 border-b border-border/50 pb-4">
            <div>
              <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-accent font-bold mb-3">
                {t("categorypage.filtered_eyebrow")}
              </p>
              <h2 className="text-3xl font-serif font-bold text-primary">{t("categorypage.filtered_title")} {category.shortTitle}</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground hover:text-accent transition-colors font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("categorypage.all_btn")}
            </Link>
          </div>

          <ProductCatalogueGrid
            products={filteredProducts}
            isLoading={isLoading}
            error={error}
            emptyMessage={`No ${category.shortTitle.toLowerCase()} are available right now.`}
          />
        </section>
      </div>
    </div>
  );
}

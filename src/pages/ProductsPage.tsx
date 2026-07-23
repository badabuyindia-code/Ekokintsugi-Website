import { ArrowRight, Layers3, PackageOpen } from "lucide-react";
import { motion } from "motion/react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useProductsCatalog } from "../hooks/useProductsCatalog";
import { useLanguage } from "../lib/LanguageContext";
import {
  getCategoryFromQuery,
  getProductCountByCategory,
  PRODUCT_CATEGORIES
} from "../lib/productCatalog";

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const categoryQuery = searchParams.get("category");
  const matchedCategory = getCategoryFromQuery(categoryQuery);
  const { products, isLoading, error } = useProductsCatalog();
  const categoryCounts = getProductCountByCategory(products);
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

  if (matchedCategory) {
    return <Navigate to={`/products/category/${matchedCategory.slug}`} replace />;
  }

  return (
    <div className="py-20 min-h-screen bg-muted/10">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-20">
          <span className="section-badge mb-4">
            <span className="section-badge-label">{t("productspage.badge")}</span>
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-primary font-bold mb-6">{t("productspage.title")}</h1>
          <p className="text-xl text-muted-foreground italic max-w-3xl mx-auto">
            {t("productspage.subtitle")}
          </p>
        </header>

        <div className="bg-card border border-border/50 p-6 md:p-12 rounded-3xl sm:rounded-[2.5rem] shadow-sm mb-16 md:mb-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <Layers3 className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-accent font-bold">
                  {t("productspage.nav_eyebrow")}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif text-primary font-bold mb-3 sm:mb-4">
                {t("productspage.nav_title")}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t("productspage.nav_desc")}
              </p>
            </div>

            <div className="bg-primary text-primary-foreground rounded-2xl sm:rounded-3xl px-6 py-4 sm:py-5 min-w-56">
              <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-primary-foreground/85 mb-2">{t("productspage.status_eyebrow")}</p>
              <p className="text-2xl sm:text-3xl font-serif font-bold mb-1">
                {isLoading ? t("productspage.syncing") : error ? t("productspage.offline") : `${products.length} ${t("productspage.products_suffix")}`}
              </p>
              <p className="text-xs sm:text-sm opacity-80">{t("productspage.status_desc")}</p>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8 sm:mb-10 border-b border-border/50 pb-4">
            <PackageOpen className="text-accent shrink-0" />
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary flex-grow">{t("productspage.browse_title")}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {PRODUCT_CATEGORIES.map((cat) => {
              const category = getLocalizedCategory(cat);
              if (!category) return null;

              return (
                <motion.article
                  key={category.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, scale: 1.015 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="group bg-card border border-border/60 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-soft lg:hover:border-accent/30 hover:border-accent/40 hover:shadow-strong transition-all duration-300 cursor-pointer"
                >
                  <div className="grid sm:grid-cols-[1fr_1.1fr] md:grid-cols-[1.05fr_1.2fr] h-full">
                    <div className="relative min-h-60 sm:min-h-72 md:min-h-0 md:aspect-square overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.shortTitle}
                        className="w-full h-full object-cover transition-transform duration-700 lg:group-hover:scale-105 group-hover:scale-108"
                        style={{ objectPosition: category.imagePosition ?? "center" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/10 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none md:block hidden" />
                      <div className="absolute left-6 bottom-6 right-6">
                        <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-accent font-bold mb-2">
                          {category.eyebrow}
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-serif text-primary-foreground font-bold">{category.shortTitle}</h3>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between">
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">{category.description}</p>
                      <div>
                        <div className="flex items-center justify-between gap-4 py-3 sm:py-4 border-y border-border/60 mb-6 sm:mb-8">
                          <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.35em] uppercase text-muted-foreground font-bold">
                            {t("productspage.category_count_label")}
                          </span>
                          <span className="text-xl sm:text-2xl font-serif text-primary font-bold">
                            {isLoading ? "--" : error ? "0" : categoryCounts[category.slug] ?? 0}
                          </span>
                        </div>
                        <Link
                          to={`/products/category/${category.slug}`}
                          className="w-full inline-flex items-center justify-between gap-4 rounded-full border border-accent/40 px-5 py-2.5 sm:px-6 sm:py-3 text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase font-bold text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                        >
                          {t("productspage.view_products_btn")}
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

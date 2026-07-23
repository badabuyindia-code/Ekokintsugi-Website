import { Link, useNavigate } from "react-router-dom";
import { PRODUCT_CATEGORIES } from "../lib/productCatalog";
import { useLanguage } from "../lib/LanguageContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <footer className="py-12 sm:py-20 bg-card border-t border-border text-left">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          <div className="sm:col-span-2">
            <div className="mb-6">
              <span className="logo-surface inline-block">
                <img src="/logo_eko.png" alt="EkoKintsugi Logo" className="h-12 sm:h-14 w-auto" />
              </span>
            </div>
            <p className="text-muted-foreground text-base sm:text-lg max-w-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="font-serif text-primary text-lg sm:text-xl font-bold mb-4 sm:mb-6">{t("footer.quick_links")}</h4>
            <ul className="space-y-3 sm:space-y-4">
              {[
                { name: t("nav.home"), path: "/" },
                { name: t("nav.about"), path: "/about" },
                { name: t("nav.products"), path: "/products" },
                { name: t("nav.process"), path: "/process" },
                { name: t("nav.impact"), path: "/impact" },
                { name: t("nav.contact"), path: "/contact" }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm sm:text-base text-muted-foreground hover:text-accent transition-colors font-medium cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-primary text-lg sm:text-xl font-bold mb-4 sm:mb-6">{t("footer.products")}</h4>
            <ul className="space-y-3 sm:space-y-4">
              {[...PRODUCT_CATEGORIES, { slug: "", shortTitle: t("footer.view_all_products") }].map((product) => (
                <li key={product.slug || product.shortTitle}>
                  <button
                    onClick={() => {
                      if (product.slug) {
                        navigate(`/products/category/${product.slug}`);
                      } else {
                        navigate("/products");
                      }
                    }}
                    className="text-sm sm:text-base text-muted-foreground hover:text-accent transition-colors text-left cursor-pointer"
                  >
                    {product.shortTitle}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Copyright {currentYear} EkoKintsugi LLP. {t("footer.copyright")}</p>
            <div className="flex gap-8">
              <Link to="/" className="text-sm text-muted-foreground hover:text-accent transition-colors font-medium">
                {t("footer.privacy")}
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-accent transition-colors font-medium">
                {t("footer.terms")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

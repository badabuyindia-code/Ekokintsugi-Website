import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PRODUCT_CATEGORIES } from "../lib/productCatalog";

export default function ProductSection() {
  const navigate = useNavigate();

  return (
    <section id="products" className="py-16 md:py-32 bg-primary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 sm:mb-20 text-primary-foreground">
          <div className="section-badge mb-6">
            <span className="section-badge-label">Eko Luxury Products</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif mb-4 sm:mb-6">Browse By Category</h2>
          <p className="text-sm sm:text-base md:text-xl text-primary-foreground max-w-3xl mx-auto opacity-80 italic leading-relaxed">
            Explore dedicated product pages for leather backpacks, leather bags, wallets, accessories, and distinct
            men's and women's footwear collections. Each category opens into a focused page with only the relevant
            products.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {PRODUCT_CATEGORIES.map((category, idx) => (
            <motion.button
              key={category.slug}
              type="button"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/products/category/${category.slug}`)}
              className="group bg-card border border-primary-foreground/5 rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-strong transition-all cursor-pointer flex flex-col md:flex-row h-full text-left lg:hover:border-accent/30"
            >
              <div className="w-full md:w-2/5 h-48 sm:h-56 md:h-auto md:aspect-square overflow-hidden relative shrink-0 flex items-center justify-center bg-muted/10">
                {/* Premium scaled & blurred backdrop to prevent stripping off the product */}
                <img
                  src={category.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-md opacity-20 scale-110 pointer-events-none"
                />
                <img
                  src={category.image}
                  alt={category.shortTitle}
                  className="relative z-10 max-w-full max-h-full object-contain p-4 sm:p-6 transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: category.imagePosition ?? "center" }}
                />
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500 z-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none md:block hidden z-20" />
              </div>

              <div className="p-6 sm:p-8 md:p-10 flex flex-col flex-grow justify-center">
                <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-accent font-bold mb-3 sm:mb-4">
                  {category.eyebrow}
                </p>
                <h3 className="text-2xl sm:text-3xl font-serif text-primary mb-3 sm:mb-4 font-bold">{category.shortTitle}</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6 sm:mb-8 flex-grow font-sans leading-relaxed">
                  {category.description}
                </p>
                <div className="mt-auto flex items-center font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold text-accent justify-between pt-4 border-t border-border">
                  <span>View Products</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

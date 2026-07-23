import { motion } from "motion/react";
import type { CatalogProduct } from "../lib/productCatalog";
import { Link } from "react-router-dom";



function formatImpactValue(value: CatalogProduct["co2_factor"] | CatalogProduct["waste_factor"], unit: string) {
  const numericValue = typeof value === "string" ? Number.parseFloat(value) : value;

  if (typeof numericValue !== "number" || Number.isNaN(numericValue)) {
    return "N/A";
  }

  return `${numericValue.toFixed(1)}${unit}`;
}

interface ProductCatalogueGridProps {
  products: CatalogProduct[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
}

export default function ProductCatalogueGrid({
  products,
  isLoading,
  error,
  emptyMessage
}: ProductCatalogueGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-card rounded-[2rem] border border-border/60 shadow-soft">
        <p className="text-primary font-serif text-2xl mb-3">Products unavailable</p>
        <p className="text-muted-foreground max-w-xl mx-auto">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-[2rem] border border-border/60 shadow-soft">
        <p className="text-muted-foreground font-mono tracking-wide">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((item, idx) => (
        <motion.article
          key={item.id || `${item.name}-${idx}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -8, scale: 1.015 }}
          transition={{ type: "spring", stiffness: 400, damping: 25, delay: idx * 0.05 }}
          className="bg-card border border-border/50 rounded-[2rem] overflow-hidden group lg:hover:border-accent/30 hover:border-accent/40 shadow-soft hover:shadow-strong transition-all duration-300 flex flex-col cursor-pointer"
        >
          <Link to={`/products/item/${item.id}`} className="flex flex-col h-full hover:no-underline">
            <div className="aspect-square bg-muted overflow-hidden relative">
              <img
                src={item.image_url || item.image || "/logo_eko.png"}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 lg:group-hover:scale-105 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none lg:block hidden" />
            </div>

            <div className="p-6 flex-grow flex flex-col">
              <p className="text-[10px] font-mono tracking-widest text-accent uppercase font-bold mb-2">
                {item.category || "Product"}
              </p>
              <h3 className="font-serif text-xl text-primary font-bold mb-3">{item.name}</h3>
              <p className="text-sm text-muted-foreground italic flex-grow mb-4">
                {item.description || item.desc || "Crafted from circular materials with traceable impact."}
              </p>
              <div className="mt-auto flex justify-between items-center text-xs font-mono font-bold uppercase tracking-widest pt-4 border-t border-border">
                <span className="text-accent opacity-70">CO2: {formatImpactValue(item.co2_factor, "kg")}</span>
                <span className="text-primary opacity-60">Waste: {formatImpactValue(item.waste_factor, "kg")}</span>
              </div>
            </div>
          </Link>
        </motion.article>
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import type { CatalogProduct } from "../lib/productCatalog";

interface ProductsCatalogState {
  products: CatalogProduct[];
  isLoading: boolean;
  error: string | null;
}

export function useProductsCatalog(): ProductsCatalogState {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/catalog", { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Product request failed with status ${response.status}`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Product response was not a product array");
        }

        setProducts(data as CatalogProduct[]);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Could not fetch products", error);
        setProducts([]);
        setError("We could not load the product page right now. Please try again in a moment.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  return { products, isLoading, error };
}

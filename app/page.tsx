"use client";

import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { HomeShopping } from "@/app/home-shopping";
import { Product, getModelListFromStore, getProductsFromStore, ProductModel } from "@/lib/catalog";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [models, setModels] = useState<ProductModel[]>([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const syncProducts = async () => {
      try {
        const [nextProducts, nextModels] = await Promise.all([getProductsFromStore(), getModelListFromStore()]);
        setProducts(nextProducts);
        setModels(nextModels);
      } finally {
        setModelsLoaded(true);
      }
    };
    void syncProducts();

    const handleCatalogChange = () => { void syncProducts(); };
    window.addEventListener("vini-catalog-updated", handleCatalogChange);

    return () => {
      window.removeEventListener("vini-catalog-updated", handleCatalogChange);
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <HomeShopping products={products} models={models} modelsLoaded={modelsLoaded} />
      <SiteFooter />
    </>
  );
}

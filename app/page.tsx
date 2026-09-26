"use client";

import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { HomeShopping } from "@/app/home-shopping";
import { Product, getModelList, getModelListFromStore, getProductsFromStore, getProductsFromStoreSync, ProductModel } from "@/lib/catalog";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [models, setModels] = useState<ProductModel[]>([]);

  useEffect(() => {
    const syncProducts = async () => {
      const [nextProducts, nextModels] = await Promise.all([getProductsFromStore(), getModelListFromStore()]);
      setProducts(nextProducts);
      setModels(nextModels);
    };
    void syncProducts();

    const handleCatalogChange = () => { void syncProducts(); };
    window.addEventListener("vini-catalog-updated", handleCatalogChange);
    window.addEventListener("storage", handleCatalogChange);

    return () => {
      window.removeEventListener("vini-catalog-updated", handleCatalogChange);
      window.removeEventListener("storage", handleCatalogChange);
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <HomeShopping products={products} models={models} />
      <SiteFooter />
    </>
  );
}

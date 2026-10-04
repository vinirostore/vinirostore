"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { HomeShopping } from "@/app/home-shopping";
import {
  defaultModels,
  products as defaultProducts,
  getModelList,
  getModelListFromStore,
  getProductsFromStore,
  getProductsFromStoreSync,
  subscribeToCatalogUpdates,
} from "@/lib/catalog";

export default function HomePage() {
  const products = useSyncExternalStore(subscribeToCatalogUpdates, getProductsFromStoreSync, () => defaultProducts);
  const models = useSyncExternalStore(subscribeToCatalogUpdates, getModelList, () => defaultModels);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    const syncProducts = async () => {
      try {
        await Promise.all([getProductsFromStore(), getModelListFromStore()]);
        setCatalogError("");
      } catch (error) {
        console.error("Could not refresh the home catalog:", error);
        setCatalogError(error instanceof Error ? error.message : "Could not refresh the home catalog.");
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
      <HomeShopping products={products} models={models} modelsLoaded catalogError={catalogError} />
      <SiteFooter />
    </>
  );
}

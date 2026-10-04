import { notFound } from "next/navigation";
import { ProductDetailExperience, type ProductDetailRecommendation } from "@/components/product-detail-experience";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getBrandListFromStore, getModelListFromStore, getProductsFromStore, getProductBySlugFromStore } from "@/lib/catalog";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, products, brands, models] = await Promise.all([
    getProductBySlugFromStore(slug),
    getProductsFromStore(),
    getBrandListFromStore(),
    getModelListFromStore(),
  ]);
  if (!product) notFound();

  const brand = brands.find((item) => item.id === product.brandId);
  const brandName = brand?.name ?? product.brand;
  const brandHref = brand ? `/brands/${brand.slug}` : "/brands";
  const sameBrandModels = models
    .filter((model) => model.brandId === product.brandId && model.id !== product.modelId)
    .slice(0, 8)
    .map((model) => {
      const modelProduct = products.find((item) => item.brandId === model.brandId && (item.modelId === model.id || item.modelSlug === model.slug));
      return {
        id: model.id,
        name: model.name,
        brand: brandName,
        href: `/brands/${encodeURIComponent(brand?.slug ?? product.brandId ?? "")}/${encodeURIComponent(model.slug)}`,
        image: model.image,
        price: modelProduct?.price ?? model.price,
        description: model.description,
      };
    });
  const relatedProducts: ProductDetailRecommendation[] = sameBrandModels.length ? sameBrandModels : products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      name: item.model ?? item.name,
      brand: item.brand,
      href: item.modelSlug && item.brandId
        ? `/brands/${encodeURIComponent(brands.find((entry) => entry.id === item.brandId)?.slug ?? item.brandId)}/${encodeURIComponent(item.modelSlug)}`
        : `/products/${encodeURIComponent(item.slug)}`,
      image: item.image,
      price: item.price,
      description: item.shortDescription,
    }));

  return (
    <>
      <SiteHeader compact />
      <ProductDetailExperience
        product={product}
        title={product.model ?? product.name}
        brandName={brandName}
        brandHref={brandHref}
        recommendations={relatedProducts}
      />
      <SiteFooter />
    </>
  );
}

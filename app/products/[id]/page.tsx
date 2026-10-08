import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByIdOrSlugQuery, ProductDetailView } from "@/modules/products";
import { getContactSettingsQuery } from "@/modules/settings";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductByIdOrSlugQuery(id);
  if (!product) {
    return { title: "Product Not Found | Commercial Engineering Associates" };
  }
  return {
    title: `${product.name} | Commercial Engineering Associates`,
    description: product.shortDesc || product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const [product, contactSettings] = await Promise.all([
    getProductByIdOrSlugQuery(id),
    getContactSettingsQuery(),
  ]);

  if (!product) {
    notFound();
  }

  const whatsappNumber =
    contactSettings.whatsapp || contactSettings.phone || "+919876543210";

  return <ProductDetailView product={product} whatsappNumber={whatsappNumber} />;
}

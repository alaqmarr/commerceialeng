import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryByIdOrSlugQuery, CategoryDetailView } from "@/modules/categories";

export const dynamic = "force-dynamic";

interface CategoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await getCategoryByIdOrSlugQuery(id);
  if (!category) {
    return { title: "Category Not Found | Commercial Engineering Associates" };
  }
  return {
    title: `${category.name} | Category | Commercial Engineering Associates`,
    description: category.description || `Industrial products under ${category.name}`,
  };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { id } = await params;
  const category = await getCategoryByIdOrSlugQuery(id, { includeProducts: true });
  if (!category) {
    notFound();
  }
  return <CategoryDetailView category={category} />;
}

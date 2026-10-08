import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUseCaseBySlugOrIdQuery, UseCaseDetailView } from "@/modules/use-cases";

export const dynamic = "force-dynamic";

interface UseCaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UseCaseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const useCase = await getUseCaseBySlugOrIdQuery(id);
  if (!useCase) return { title: "Use Case Not Found | Commercial Engineering Associates" };
  return {
    title: `${useCase.title} | Application | Commercial Engineering Associates`,
    description: useCase.description.slice(0, 160),
  };
}

export default async function UseCaseDetailPage({ params }: UseCaseDetailPageProps) {
  const { id } = await params;
  const useCase = await getUseCaseBySlugOrIdQuery(id, { includeProducts: true });
  if (!useCase) notFound();
  return <UseCaseDetailView useCase={useCase} />;
}

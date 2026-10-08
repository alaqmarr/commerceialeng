import React from "react";
import type { Metadata } from "next";
import { AdminProductManager } from "@/modules/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Management | Admin Portal",
};

export default function AdminProductsPage() {
  return <AdminProductManager />;
}

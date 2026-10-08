import React from "react";
import { AdminCategoryManager } from "@/modules/categories";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Category Management | Admin Portal",
};

export default function AdminCategoriesPage() {
  return <AdminCategoryManager />;
}

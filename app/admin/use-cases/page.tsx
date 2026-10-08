import React from "react";
import { AdminUseCaseManager } from "@/modules/use-cases";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Use-Case Management | Admin Portal",
};

export default function AdminUseCasesPage() {
  return <AdminUseCaseManager />;
}

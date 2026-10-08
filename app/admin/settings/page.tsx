import React from "react";
import { AdminSettingsManager } from "@/modules/settings";

export const metadata = {
  title: "Contact & SMTP Settings | Admin Portal",
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <AdminSettingsManager />
    </div>
  );
}

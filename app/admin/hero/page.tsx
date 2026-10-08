import React from "react";
import { AdminHeroManager } from "@/modules/hero";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hero Slides Carousel | Admin Portal",
};

export default function AdminHeroPage() {
  return <AdminHeroManager />;
}

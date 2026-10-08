import { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAuthSession } from "@/lib/auth";
import {
  Package,
  FolderTree,
  Layers,
  Image as ImageIcon,
  Settings,
  Mail,
  LayoutDashboard,
  ExternalLink,
  BarChart3,
  Users,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // Bypass shell decoration on login page
  if (pathname.includes("/admin/login")) {
    return <>{children}</>;
  }

  // Double-verify session on server side
  const session = await getAuthSession();
  if (!session) {
    redirect("/admin/login");
  }

  const navLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/use-cases", label: "Use-Cases", icon: Layers },
    { href: "/admin/hero", label: "Hero Slides", icon: ImageIcon },
    { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      {/* Top Admin Utility Bar */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.webp"
            alt="CEA Logo"
            width={28}
            height={28}
            className="h-7 w-7 rounded object-contain shrink-0"
            priority
          />
          <Link href="/admin" className="font-bold tracking-wider text-xs sm:text-sm uppercase text-gray-900 hover:text-red-600 transition-colors">
            Commercial Engineering Associates — Admin Console
          </Link>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>
            Signed in as <strong className="text-red-600">{session.user?.email}</strong>
          </span>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded border border-gray-200 text-xs transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Sub-header Navigation Tabs */}
      <nav className="border-b border-gray-200 bg-white px-6 py-2 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all whitespace-nowrap"
            >
              <Icon className="w-3.5 h-3.5 text-red-600" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Admin View Container */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}

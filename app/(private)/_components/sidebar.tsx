"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Crown,
  FileText,
  Calendar,
  Newspaper,
  Award,
  Image,
  CreditCard,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Members", href: "/members", icon: UserCheck },
  { name: "Agencies", href: "/agencies", icon: Building2 },
  { name: "Committees", href: "/committees", icon: Crown },
  { name: "Blogs", href: "/blogs", icon: FileText },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Banners", href: "/banners", icon: Image },
  { name: "Certifications", href: "/certifications", icon: Award },
  { name: "Payments", href: "/payments", icon: CreditCard },
];

export function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">BSSAJ Admin</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-primary"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar() {
  return (
    <>
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
        <SidebarContent />
      </div>
    </>
  );
}

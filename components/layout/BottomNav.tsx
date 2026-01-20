"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  BarChart3,
  History,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Chat", href: "/chat", icon: MessageSquare, special: true },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Riwayat", href: "/sales-history", icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F4C75] border-t border-[#00446b] z-30 pb-safe shadow-lg">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          // Special center button (Chat) - with circular design but in normal flow
          if (item.special) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 -mt-3"
              >
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300",
                    isActive
                      ? "bg-[#FF9600] scale-110"
                      : "bg-[#FF9600] hover:scale-105",
                  )}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </Link>
            );
          }

          // Regular buttons
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors duration-200 flex-1",
                isActive ? "text-[#FF9600]" : "text-white/50 hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive && "drop-shadow-[0_0_8px_rgba(255,150,0,0.5)]",
                )}
              />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

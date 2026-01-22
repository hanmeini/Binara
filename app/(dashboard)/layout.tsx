"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TemplateSidebar } from "@/components/layout/TemplateSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null; // Will redirect
  }

  const isChatPage = pathname === "/chat";
  const isTemplatePage =
    pathname.startsWith("/template") || pathname.startsWith("/history");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isChatPage && (isTemplatePage ? <TemplateSidebar /> : <Sidebar />)}
      <main className="flex-1 pb-16 md:pb-0 min-h-screen transition-all duration-300 w-full relative">
        {children}
      </main>
      {!isChatPage && <BottomNav />}
    </div>
  );
}

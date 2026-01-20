"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isShowcase = pathname === "/showcase";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 w-full transition-all duration-300",
          isShowcase ? "z-100" : "z-50",
          scrolled && !isShowcase
            ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
                {/* Simple circle logo placeholder from design */}
                <div className="w-4 h-4 rounded-full bg-white/30" />
              </div>
              <span
                className={cn(
                  "text-xl font-bold",
                  isShowcase ? "text-white" : "text-gray-900",
                )}
              >
                Arsa
              </span>
            </div>

            {/* Centered Navigation (Desktop) */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isShowcase
                    ? "text-white/80 hover:text-white"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                Beranda
              </Link>
              <Link
                href="/about"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isShowcase
                    ? "text-white/80 hover:text-white"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                Tentang Arsa
              </Link>
              <Link
                href="/showcase"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isShowcase
                    ? "text-white/80 hover:text-white"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                Showcase
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isShowcase
                    ? "text-white/80 hover:text-white"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                Harga
              </Link>
              <Link
                href="/contact"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isShowcase
                    ? "text-white/80 hover:text-white"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                Kontak
              </Link>
            </div>

            {/* Right Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/register"
                className={cn(
                  "font-medium text-sm transition-colors",
                  isShowcase
                    ? "text-white hover:text-white/80"
                    : "text-gray-900 hover:text-gray-600",
                )}
              >
                Daftar
              </Link>
              <Link
                href="/login"
                className="bg-[var(--accent)] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-amber-600 transition-colors"
              >
                Coba Gratis
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={cn(
                  "p-2",
                  isShowcase ? "text-white" : "text-gray-900",
                )}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer - Rendered via Portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/20 z-110 backdrop-blur-sm md:hidden"
                />
                {/* Drawer */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed top-0 right-0 h-screen w-[280px] bg-white z-120 shadow-2xl rounded-l-3xl p-6 flex flex-col gap-6 md:hidden"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-white/30" />
                      </div>
                      <span className="text-xl font-bold text-gray-900">
                        Arsa
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    <Link
                      href="/"
                      className="text-gray-600 hover:text-gray-900 text-lg font-medium transition-colors py-3 border-b border-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Beranda
                    </Link>
                    <Link
                      href="/about"
                      className="text-gray-600 hover:text-gray-900 text-lg font-medium transition-colors py-3 border-b border-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tentang Arsa
                    </Link>
                    <Link
                      href="/showcase"
                      className="text-gray-600 hover:text-gray-900 text-lg font-medium transition-colors py-3 border-b border-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Showcase
                    </Link>
                    <Link
                      href="/pricing"
                      className="text-gray-600 hover:text-gray-900 text-lg font-medium transition-colors py-3 border-b border-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Harga
                    </Link>
                    <Link
                      href="/contact"
                      className="text-gray-600 hover:text-gray-900 text-lg font-medium transition-colors py-3 border-b border-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Kontak
                    </Link>
                  </div>

                  <div className="mt-auto flex flex-col gap-4">
                    <Link
                      href="/register"
                      className="w-full py-3 text-center text-gray-900 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Daftar
                    </Link>
                    <Link
                      href="/login"
                      className="w-full py-3 text-center bg-[var(--accent)] text-white font-bold rounded-xl shadow-lg shadow-amber-200 hover:bg-amber-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Coba Gratis
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

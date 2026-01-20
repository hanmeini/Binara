"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Database, Wand2, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Introduction } from "@/components/landing/Introduction";
import { Footer } from "@/components/landing/Footer";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { ImpactSection } from "@/components/landing/ImpactSection";
import { TestimonialSection } from "@/components/landing/TestimonialSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Introduction Section */}
      <Introduction />

      {/* New Features Grid Section */}
      <FeaturesGrid />

      {/* Impact Section */}
      <ImpactSection />

      {/* Testimonial Section */}
      <TestimonialSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Image from "next/image";
import { Loader2, Download, Calendar, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";

interface GeneratedDesign {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  productName: string;
  createdAt: any;
}

// Dummy data for testing
const dummyDesigns: GeneratedDesign[] = [
  {
    id: "1",
    imageUrl: "/images/template1.png",
    prompt: "Sample prompt 1",
    style: "Minimalist",
    productName: "Coffee Brand",
    createdAt: { seconds: Date.now() / 1000 },
  },
  {
    id: "2",
    imageUrl: "/images/template2.png",
    prompt: "Sample prompt 2",
    style: "Vibrant",
    productName: "Snack Pack",
    createdAt: { seconds: (Date.now() - 86400000) / 1000 },
  },
  {
    id: "3",
    imageUrl: "/images/template3.png",
    prompt: "Sample prompt 3",
    style: "Luxury",
    productName: "Perfume Bottle",
    createdAt: { seconds: (Date.now() - 172800000) / 1000 },
  },
];

export default function HistoryPage() {
  const [designs, setDesigns] = useState<GeneratedDesign[]>(dummyDesigns); // Initialize with dummy data
  const [loading, setLoading] = useState(false); // Set loading to false initially
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Commented out to use dummy data
      // if (currentUser) {
      //   fetchHistory(currentUser.uid);
      // } else {
      //   setLoading(false);
      // }
    });

    return () => unsubscribe();
  }, []);

  const fetchHistory = async (userId: string) => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "generated_designs"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const fetchedDesigns: GeneratedDesign[] = [];
      querySnapshot.forEach((doc) => {
        fetchedDesigns.push({ id: doc.id, ...doc.data() } as GeneratedDesign);
      });
      setDesigns(fetchedDesigns);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#0F4C75]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] p-6 md:p-12 relative">
      {/* Blue Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/50 to-blue-50/50 -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Section */}

        <div>
          <h1 className="text-3xl font-bold text-[#0F4C75]">Riwayat Desain</h1>
          <p className="text-gray-500 mt-2">
            Koleksi lengkap desain yang pernah Anda buat.
          </p>
        </div>

        {designs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-[#0F4C75]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Belum ada riwayat
            </h3>
            <p className="text-gray-500 mt-2">
              Mulai buat desain pertama Anda sekarang!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {designs.map((design, index) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <Image
                    src={design.imageUrl}
                    alt={design.productName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <a
                      href={design.imageUrl}
                      download={`design-${design.id}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <Download className="w-5 h-5 text-[#0F4C75]" />
                    </a>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 truncate pr-2">
                      {design.productName}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-[#0F4C75] rounded-full uppercase tracking-wider">
                      {design.style}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">
                    {formatDate(design.createdAt)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <div className="flex justify-center pt-8">
          <a
            href="/dashboard"
            className="px-8 py-4 bg-[#0F4C75] text-white font-bold rounded-xl shadow-lg hover:bg-[#0a3554] hover:scale-105 transition-all flex items-center gap-2"
          >
            <Layers className="w-5 h-5" />
            Buat Desain Baru
          </a>
        </div>
      </div>
    </div>
  );
}

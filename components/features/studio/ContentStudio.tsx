"use client";

import { useState } from "react";
import {
  Upload,
  Sparkles,
  Image as ImageIcon,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { generateCaption } from "@/lib/gemini";

export function ContentStudio() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setCaption("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    try {
      const prompt = image
        ? "Buatkan caption penjualan yang menarik, persuasif, dan menggunakan emoji untuk produk ini. Sertakan 3-5 hashtag yang relevan. Gaya bahasa santai tapi profesional."
        : "Buatkan caption penjualan umum untuk toko serba ada yang mempromosikan barang-barang berkualitas.";

      const result = await generateCaption(prompt, image || undefined);
      setCaption(result || "");
    } catch (error) {
      console.error(error);
      setCaption(
        "Maaf, terjadi kesalahan saat menghubungkan ke AI. Pastikan API Key Anda valid.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Upload Section */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[var(--primary)]" />
            Product Image
          </h2>

          <div className="relative group">
            <div
              className={cn(
                "border-2 border-dashed border-gray-300 rounded-xl h-80 flex flex-col items-center justify-center transition-colors",
                !image && "hover:border-[var(--primary)] hover:bg-indigo-50/30",
                image && "border-solid border-transparent",
              )}
            >
              {image ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-indigo-50 text-[var(--primary)] rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    SVG, PNG, JPG or GIF (max. 5MB)
                  </p>
                </>
              )}
              <input
                type="file"
                className={cn(
                  "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
                  image && "hidden",
                )}
                onChange={handleUpload}
                accept="image/*"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="flex-1 py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Remove Background
            </button>
            <button
              onClick={handleGenerate}
              disabled={isProcessing}
              className={cn(
                "flex-1 py-2.5 px-4 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-200",
                isProcessing
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[var(--primary)] hover:bg-indigo-600",
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Caption
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <AnimatePresence>
        {caption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                  AI Generated Caption
                </h2>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:text-indigo-700 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied!" : "Copy Text"}
                </button>
              </div>

              <div className="flex-1 bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {caption}
              </div>

              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={handleGenerate}
                  className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5"
                >
                  Regenerate
                </button>
                <button className="bg-[var(--accent)] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm shadow-amber-100">
                  Use This
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { generateDesign } from "@/app/actions/generateDesign";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { db, auth } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface DesignGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export function DesignGeneratorModal({
  isOpen,
  onClose,
  apiKey,
}: DesignGeneratorModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [style, setStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setGeneratedImage(null); // Reset generated image when new file uploaded
    }
  };

  const handleGenerate = async () => {
    if (!file || !productName || !style) return;

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      // Construct prompt
      const prompt = `Professional product photography of ${productName}, commercial advertisement style, ${style} aesthetic, high quality, photorealistic, 8k`;
      formData.append("prompt", prompt);

      // Call Server Action
      const generatedDataUrl = await generateDesign(formData, apiKey);

      setGeneratedImage(generatedDataUrl);

      // --- Persistence Logic ---
      if (auth.currentUser) {
        // 1. Convert Data URL to Blob for upload
        const response = await fetch(generatedDataUrl);
        const blob = await response.blob();
        const imageFile = new File([blob], "generated-design.png", {
          type: "image/png",
        });

        // 2. Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(imageFile);

        // 3. Save to Firestore
        await addDoc(collection(db, "generated_designs"), {
          userId: auth.currentUser.uid,
          imageUrl: cloudinaryUrl,
          prompt: prompt,
          style: style,
          productName: productName,
          createdAt: serverTimestamp(),
        });
        console.log("Design saved to history!");
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      alert(error.message || "Something went wrong during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-[2rem] w-full max-w-5xl h-[600px] shadow-2xl overflow-hidden flex pointer-events-auto relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 z-10 transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>

              {/* Left Column: Controls */}
              <div className="w-1/3 p-8 border-r border-gray-100 flex flex-col bg-gray-50/50">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#0F4C75] mb-1">
                    Generate Content
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Create stunning visuals in seconds
                  </p>
                </div>

                <div className="space-y-6 flex-1">
                  {/* Style Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Gaya Konten
                    </label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F4C75]/20 focus:border-[#0F4C75] bg-white text-gray-700 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Pilih gaya konten yang disukai
                      </option>
                      <option value="minimalist">Minimalist</option>
                      <option value="vibrant pop art">Vibrant Pop Art</option>
                      <option value="luxury elegant">Luxury & Elegant</option>
                      <option value="organic nature">Organic & Natural</option>
                      <option value="futuristic cyberpunk">
                        Futuristic Cyberpunk
                      </option>
                      <option value="magazine editorial">
                        Magazine Editorial
                      </option>
                    </select>
                  </div>

                  {/* Product Name Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Isi nama produk Anda"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F4C75]/20 focus:border-[#0F4C75] bg-white text-gray-900"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={!file || !productName || !style || isGenerating}
                  className="w-full py-4 rounded-xl bg-[#0F4C75] text-white font-bold text-lg hover:bg-[#0a3554] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Design
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Preview/Canvas */}
              <div className="w-2/3 p-8 bg-white flex items-center justify-center relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                {/* Image Display Area */}
                <div
                  className="w-full h-full rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50 group hover:border-[#0F4C75]/50 transition-colors cursor-pointer"
                  onClick={() =>
                    !generatedImage && fileInputRef.current?.click()
                  }
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {generatedImage ? (
                    // Show Generated Result
                    <div className="relative w-full h-full">
                      <Image
                        src={generatedImage}
                        alt="Generated Design"
                        fill
                        className="object-contain"
                      />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGeneratedImage(null);
                          }}
                          className="px-4 py-2 bg-white/90 backdrop-blur text-sm font-bold text-gray-700 rounded-lg shadow hover:bg-white"
                        >
                          Reset
                        </button>
                        <a
                          href={generatedImage}
                          download="design.png"
                          target="_blank"
                          className="px-4 py-2 bg-[#0F4C75] text-white text-sm font-bold rounded-lg shadow hover:bg-[#0a3554]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ) : previewUrl ? (
                    // Show Uploaded Preview
                    <div className="relative w-full h-full">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain opacity-90"
                      />
                      {/* Overlay Hint */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                        <span className="px-4 py-2 bg-white/90 rounded-full text-sm font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to change image
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Empty State / Dropzone
                    <div className="text-center p-6">
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 text-[#0F4C75]">
                        <Upload className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Upload Product Image
                      </h3>
                      <p className="text-gray-400 text-sm max-w-xs mx-auto">
                        Click here to upload your raw product photo.
                        <br />
                        Supported: JPG, PNG
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

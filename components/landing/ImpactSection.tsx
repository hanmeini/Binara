"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const stats = [
  {
    number: "500+",
    label: "Usaha Terbantu",
    description: "UMKM telah bergabung dan tumbuh bersama Arsa",
  },
  {
    number: "1.200+",
    label: "Insight Bisnis",
    description: "Rekomendasi strategis dihasilkan setiap hari",
  },
  {
    number: "24/7",
    label: "Asisten AI Aktif",
    description: "Siap membantu menjawab pertanyaan bisnismu kapanpun",
  },
];

const companies = [
  {
    name: "Kopi Janji Jiwa",
    logo: "/images/du anyam.png",
  },
  {
    name: "Haus!",
    logo: "/images/es-teh-nusantara-logo-png_seeklogo-438137-removebg-preview.png",
  },
  {
    name: "Kebab Turki Baba Rafi",
    logo: "/images/janji jiw.png",
  },
  {
    name: "Sabana",
    logo: "/images/du ayam.png",
  },
  {
    name: "Teh Poci",
    logo: "/images/kopi kenangan.jpg",
  },
  {
    name: "Geprek Bensu",
    logo: "/images/du anyam.png",
  },
  {
    name: "Fore Coffee",
    logo: "/images/roti gembong.png",
  },
  {
    name: "Ngikan",
    logo: "/images/du anyam.png",
  },
  {
    name: "Tahu Jeletot",
    logo: "/images/tiebymin.png",
  },
  {
    name: "Bebek Kaleyo",
    logo: "/images/jus-semangka.png",
  },
];

export function ImpactSection() {
  return (
    <section className="bg-white py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex-shrink-0 text-center lg:text-left"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#0D0E25] leading-tight mb-2">
              Dampak Nyata
              <br />
              <span className="relative inline-block mt-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0A70AB] to-[#FE8B1D] font-semibold">
                  Arsa
                </span>
                <span className="absolute -bottom-2 left-0 w-1/2 h-[3px] bg-gradient-to-r from-[#0A70AB] to-[#FE8B1D] rounded-full"></span>
              </span>
            </h2>
            <p className="mt-6 text-gray-500 text-lg font-light leading-relaxed max-w-sm">
              Kami berkomitmen untuk mendorong pertumbuhan bisnis Anda melalui
              teknologi yang tepat guna.
            </p>
          </motion.div>

          {/* Right Cards */}
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#0F4C75]/20 shadow-sm hover:shadow-xl transition-all duration-300 cursor-default flex flex-col justify-center min-h-[200px] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAFAFA] rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700 ease-out" />

                <div className="relative z-10">
                  <h3 className="text-4xl md:text-5xl font-light text-[#0F4C75] mb-2 tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
                    {stat.number}
                  </h3>
                  <p className="text-lg font-medium text-[#0D0E25] mb-2">
                    {stat.label}
                  </p>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Company Logos Slider */}
        <div className="mt-20 border-t border-gray-100 pt-16">
          <p className="text-center text-gray-400 text-sm font-light mb-8">
            Dipercaya oleh 1000+ UMKM di seluruh Indonesia
          </p>

          <div className="relative w-full overflow-hidden mask-linear-fade">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

            <div className="flex overflow-hidden">
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: "-50%" }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="flex gap-12 sm:gap-16 md:gap-20 whitespace-nowrap pr-12 sm:pr-16 md:pr-20"
              >
                {[...companies, ...companies].map((company, index) => (
                  <div
                    key={index}
                    className="relative w-32 h-12 md:w-40 md:h-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                  >
                    <Image
                      src={company.logo}
                      alt={company.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

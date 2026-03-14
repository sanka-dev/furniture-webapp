"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Box,
  LayoutGrid,
} from "lucide-react";

const HERO_PALETTES = [
  {
    id: "warm",
    label: "Warm cream",
    wall: "#fff1c4",
    floor: "#f8bd77",
    accent: "#ff8d5c",
    accentSoft: "#ffd6c8",
    detail: "#ffcf5a",
    plant: "#b7f266",
  },
  {
    id: "mint",
    label: "Mint studio",
    wall: "#dbf7df",
    floor: "#d7b38c",
    accent: "#61d595",
    accentSoft: "#e6ffe5",
    detail: "#3ec5ff",
    plant: "#ffcf5a",
  },
  {
    id: "sky",
    label: "Sky loft",
    wall: "#d9f2ff",
    floor: "#e6be8f",
    accent: "#3ec5ff",
    accentSoft: "#e7f9ff",
    detail: "#b7f266",
    plant: "#ff8d5c",
  },
];

const HERO_INTERACTIVE_ITEMS = [
  {
    id: "table",
    label: "Table",
    icon: LayoutGrid,
    x: 132,
    y: 120,
    width: 72,
    height: 72,
    radius: "999px",
    tone: "detail",
  },
  {
    id: "chair",
    label: "Chair",
    icon: Box,
    x: 232,
    y: 128,
    width: 64,
    height: 64,
    radius: "14px",
    tone: "accent",
  },
];

export default function Home() {
  const [paletteId, setPaletteId] = useState(HERO_PALETTES[0].id);
  const heroPreviewRef = useRef<HTMLDivElement | null>(null);
  const currentPalette =
    HERO_PALETTES.find((palette) => palette.id === paletteId) ?? HERO_PALETTES[0];

  return (
    <div className="flex flex-col overflow-hidden bg-[#fff7e8] text-slate-900">
      <section className="relative flex min-h-screen items-center  overflow-hidden px-6 pb-12 pt-28 sm:pb-16 sm:pt-32 "> 
        <div className="cartoon-dot-grid absolute inset-0 opacity-50" />
        <div className="absolute -left-12 top-28 h-40 w-40 rounded-full bg-[#ffcf5a]/70 blur-3xl" />
        <div className="absolute right-0 top-10 h-48 w-48 rounded-full bg-[#7ad9ff]/55 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#ffa486]/45 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <span className="cartoon-frame inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700 shadow-none">
                Sri Lanka's #1 Furniture Designer  
              </span> 
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.55 }}
              className="font-display-cartoon mt-7 max-w-2xl text-5xl font-medium  leading-[0.95] sm:text-6xl lg:text-7xl"
            >
              Design a room that already feels lived in.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.55 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-slate-700 sm:text-xl" 
            >
              Ayubowan! We are here to turn your imagination into reality. We specialized in designing custom rooms for anyone with their own unique style.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.55 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <Link href="/planner">
                <Button
                  size="lg"
                  className="cartoon-button h-14 rounded-full bg-[#ff8d5c] px-7 text-base font-bold text-slate-900 hover:bg-[#ff8d5c]"
                >
                  Open room planner
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  className="cartoon-button h-14 rounded-full bg-[#b7f266] px-7 text-base font-bold text-slate-900 hover:bg-[#b7f266]"
                >
                  Create account
                </Button>
              </Link>
            </motion.div>

   
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Interactive preview</p>

              <div
                ref={heroPreviewRef}
                className="relative mt-3 h-64 overflow-hidden rounded-xl border border-slate-200"
                style={{
                  background: `linear-gradient(180deg, ${currentPalette.wall} 0%, ${currentPalette.wall} 58%, ${currentPalette.floor} 58%, ${currentPalette.floor} 100%)`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(15,23,42,0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.11) 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />
                <div className="absolute left-3 top-3 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600">
                  Drag table and chair
                </div>

                {HERO_INTERACTIVE_ITEMS.map((item) => {
                  const backgroundColor =
                    item.tone === "detail" ? currentPalette.detail : currentPalette.accent;

                  return (
                    <motion.div
                      key={item.id}
                      drag
                      dragConstraints={heroPreviewRef}
                      dragElastic={0.08}
                      dragMomentum={false}
                      initial={{ x: item.x, y: item.y }}
                      whileDrag={{ scale: 1.04, zIndex: 20 }}
                      className="absolute left-0 top-0 flex cursor-grab items-center justify-center border border-slate-400/40 text-slate-800 shadow-sm active:cursor-grabbing"
                      style={{
                        width: item.width,
                        height: item.height,
                        borderRadius: item.radius,
                        backgroundColor,
                      }}
                    >
                      <div className="text-center">
                        <item.icon className="mx-auto h-4 w-4" />
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.04em]">{item.label}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Palette</p>
                <div className="flex gap-2">
                  {HERO_PALETTES.map((palette) => (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => setPaletteId(palette.id)}
                      className={cn(
                        "h-7 w-7 rounded-full border",
                        palette.id === paletteId ? "border-slate-900" : "border-slate-300"
                      )}
                      style={{ backgroundColor: palette.wall }}
                      aria-label={palette.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

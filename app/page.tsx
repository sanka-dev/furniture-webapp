"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FurniturePreview3D } from "@/components/planner/furniture-preview-3d";
import { getCatalogItem } from "@/lib/data/furniture";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Box,
  Eye,
  LayoutGrid,
  Layers,
  MousePointerClick,
  Palette,
  Ruler,
  Save,
  ScanLine,
  Sofa,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" as const },
  }),
};

const FEATURES = [
  {
    icon: Ruler,
    title: "Sketch the real room shape",
    description:
      "Capture width, depth, odd corners, and wall lengths so your digital room behaves like the real one.",
  },
  {
    icon: Sofa,
    title: "Drop in furniture fast",
    description:
      "Pull sofas, chairs, side tables, and beds straight onto the canvas without breaking the conversation with the customer.",
  },
  {
    icon: Palette,
    title: "Paint the vibe live",
    description:
      "Swap wall tones, flooring, and upholstery colors until the room starts feeling like home instead of a showroom guess.",
  },
  {
    icon: Box,
    title: "Peek in 3D anytime",
    description:
      "Jump from plan view into a playful 3D preview to check spacing, proportions, and the overall mood in seconds.",
  },
  {
    icon: LayoutGrid,
    title: "Organize with a clean grid",
    description:
      "Keep layouts readable with a simple floor-grid canvas that makes movement, spacing, and alignment feel obvious.",
  },
  {
    icon: Save,
    title: "Save every playful draft",
    description:
      "Store multiple versions per customer so you can compare ideas side by side instead of rebuilding layouts from scratch.",
  },
];

const STEPS = [
  {
    icon: ScanLine,
    step: "01",
    title: "Map the room",
    description:
      "Start with dimensions, shape, wall color, and flooring so the canvas matches the room you are designing for.",
  },
  {
    icon: MousePointerClick,
    step: "02",
    title: "Drop in furniture",
    description:
      "Drag products from the catalog into place and nudge them around until the flow of the room feels right.",
  },
  {
    icon: Layers,
    step: "03",
    title: "Style the palette",
    description:
      "Mix surfaces and colors to match the customer's taste without losing track of proportion and layout.",
  },
  {
    icon: Eye,
    step: "04",
    title: "Show the finished room",
    description:
      "Open the 3D view and confirm the design together before the customer commits to anything.",
  },
];

const AUDIENCES = [
  {
    title: "For in-store designers",
    description:
      "Guide customers live, sketch ideas quickly, and avoid awkward guesswork around fit and color.",
    tone: "bg-[#ffede2]",
  },
  {
    title: "For customers",
    description:
      "See a room plan that feels friendly and understandable instead of technical or intimidating.",
    tone: "bg-[#e8f7ff]",
  },
  {
    title: "For store teams",
    description:
      "Keep reusable concepts, compare options faster, and reduce returns caused by mismatched expectations.",
    tone: "bg-[#edf9d8]",
  },
];

const STORY_CARDS = [
  {
    title: " Your Dream. Our Masterpice. ",
    body: " We are committed to crafting personalized room designs that reflect your unique style and preferences. With our expert designers and cutting-edge technology, we turn your Dream into a stunning reality. ",
    tone: "bg-[#e8f7ff]",
  },
  {
    title: " Fully Customizable Room Planning ",
    body: " Our platform offers a fully customizable room planning experience, allowing you to create and visualize your ideal living space with ease.  ",
    tone: "bg-white",
  },
  { 
    title: " Designed for Everyone ",
    body: " Whether you're a seasoned interior designer or just starting to explore your style, our platform is designed to be accessible and user-friendly for everyone.  ",
    tone: "bg-[#edf9d8]", 
  },
];

const HERO_STATS = [
  {
    value: "2D + 3D",
    label: "Preview every room from plan to walkthrough.",
    tone: "bg-[#ffede2]",
  },
  {
    value: "10+",
    label: "Furniture pieces ready for live customer sessions.",
    tone: "bg-[#e8f7ff]",
  },
  {
    value: "Fast",
    label: "Built for quick changes without slowing the conversation.",
    tone: "bg-[#edf9d8]",
  },
  {
    value: "Save",
    label: "Keep multiple design ideas before the customer decides.",
    tone: "bg-[#fff3bf]",
  },
];

const HERO_PREVIEW_ITEM = getCatalogItem("fullset") ?? getCatalogItem("Chair 1");

export default function Home() {
  return (
    <div className="flex flex-col overflow-hidden bg-[#fff7e8] text-slate-900">
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 pb-12 pt-28 sm:pb-16 sm:pt-32">
        <div className="cartoon-dot-grid absolute inset-0 opacity-50" />
        <div className="absolute -left-12 top-28 h-40 w-40 rounded-full bg-[#ffcf5a]/70 blur-3xl" />
        <div className="absolute right-0 top-10 h-48 w-48 rounded-full bg-[#7ad9ff]/55 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#ffa486]/45 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
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
              className="font-display-cartoon mt-7 max-w-2xl text-5xl font-medium leading-[0.95] sm:text-6xl lg:text-7xl"
            >
              Clean room planning, without the mess.
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
            className="relative"
          >
            <div className="cartoon-frame rounded-[34px] bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:p-6">
              <div className="rounded-[28px] border border-slate-200 bg-[#fffaf0] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Planner preview
                    </p>
                    <h3 className="font-display-cartoon mt-2 text-3xl text-slate-900">
                      Living room layout
                    </h3>
                  </div>
                  <div className="rounded-full bg-[#000000] text-white border border-slate-300 px-3  py-1 text-xs font-semibold text-slate-700">
                    Ready to present
                  </div>
                </div>

                <div className="mt-5 rounded-[26px] border border-slate-200 bg-[#ffffff] p-4">
                  <div className="relative min-h-[420px] overflow-hidden rounded-[22px] border border-slate-300  sm:min-h-[480px]">
                    <div className="absolute inset-x-0 top-0 z-10 h-24  " />
               
                    {HERO_PREVIEW_ITEM ? (
                      <div className="absolute inset-0">
                        <FurniturePreview3D item={HERO_PREVIEW_ITEM} />
                      </div>
                    ) : null}
          
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-10  sm:pb-14">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          {HERO_STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={index}
              variants={fadeUp}
              className={`cartoon-frame rounded-[30px] ${stat.tone} p-6`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
                Quick stat
              </p>
              <p className="font-display-cartoon mt-4 text-4xl text-slate-900">
                {stat.value}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>


      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="cartoon-frame rounded-[34px] bg-[#ffede2] p-8 sm:p-10"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-600">
              Cutting-Edge Designing Technology 
            </p>
            <h2 className="font-display-cartoon mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">
              A playful planner that makes design feel like fun, not work.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-700 sm:text-lg">
              We designed our planner to feel more like a creative game than a technical tool. Big, colorful pieces. A simple grid. A friendly 3D preview. No overwhelming options or complex controls.
            </p>
               <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
              Just a space to play with ideas, sketch freely, and find the perfect room composition together with your customers.
            </p> 
            

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                " User Friendly Tool ",
                " Built for Designers, By Designers ", 
                " All in One Designing Tool ",
              ].map((chip) => (
                <div
                  key={chip}
                  className="rounded-full border-[3px] border-slate-900 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                >
                  {chip}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid gap-4"
          >
            {STORY_CARDS.map((card, index) => (
              <motion.div
                key={card.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={index}
                variants={fadeUp}
                className={`cartoon-frame rounded-[30px] ${card.tone} p-6`}
              > 
                <h3 className="font-display-cartoon text-2xl">{card.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-700">{card.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      <section className="px-6 pb-24 pt-8 sm:pb-28">
        <div className="cartoon-frame mx-auto max-w-5xl rounded-[40px] bg-[#ffddcf] p-4 sm:p-5">
          <div className="cartoon-frame relative overflow-hidden rounded-[32px] bg-[#fff7e8] px-6 py-12 text-center sm:px-10 sm:py-16">
            <div className="absolute left-8 top-8 h-30 w-30 rounded-full bg-[#7ad9ff]/80 blur-xl" />
            <div className="absolute bottom-8 right-10 h-30 w-30 rounded-full bg-[#ffcf5a]/80 blur-2xl" />
            <div className="absolute right-1/4 top-12 h-130 w-10 rounded-full bg-[#b7f266]/80 blur-lg" />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative mx-auto max-w-2xl"
            >
              <motion.p
                variants={fadeUp}
                custom={0}
                className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-600"
              >
                Ready to try the planner
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="font-display-cartoon text-3xl sm:text-4xl lg:text-5xl"
              >
                Start with a cheerful room, then let the furniture do the selling.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-700"
              >
                Open the planner, shape the room, place the pieces, and give customers a visual they can trust without overwhelming them.
              </motion.p>
              <motion.div
                variants={fadeUp}
                custom={3}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Link href="/planner">
                  <Button
                    size="lg"
                    className="cartoon-button h-14 rounded-full bg-[#ff8d5c] px-8 text-base font-bold text-slate-900 hover:bg-[#ff8d5c]"
                  >
                    Launch planner
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="cartoon-button h-14 rounded-full bg-white px-8 text-base font-bold text-slate-900 hover:bg-white"
                  >
                    Log in to your account 
                  </Button>
                </Link>
              </motion.div>
              <motion.p variants={fadeUp} custom={4} className="mt-6 text-sm font-semibold text-slate-600">
                Exclusive only for in-store designers. 
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

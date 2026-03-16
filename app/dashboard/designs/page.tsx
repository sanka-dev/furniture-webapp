"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { usePortfolioStore } from "@/lib/stores/portfolio-store";
import { useDesignStore } from "@/lib/stores/design-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Box,
  Calendar,
  Ruler,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number): { opacity: number; y: number; transition: object } => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function DesignsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { designs, deleteDesign, fetchDesigns, loading } = usePortfolioStore();
  const loadDesign = useDesignStore((s) => s.loadDesign);
  const clearDesign = useDesignStore((s) => s.clearDesign);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user?.id) {
      fetchDesigns(user.id);
    }
  }, [user?.id, fetchDesigns]);

  if (!isAuthenticated || !user) return null;

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#b0664c] mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Loading designs...</p>
        </div>
      </div>
    );
  }

  const userDesigns = designs.filter((d) => d.userId === user.id);

  const handleEdit = (id: string) => {
    const design = designs.find((d) => d.id === id);
    if (design) {
      loadDesign(design);
      router.push(`/planner?edit=${id}`);
    }
  };

  const handleNewDesign = () => {
    clearDesign();
    router.push("/planner");
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDesign(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="font-display-cartoon text-3xl text-slate-900">Designs </h1>
          <p className="text-slate-500 text-sm mt-1">
            {userDesigns.length} design{userDesigns.length !== 1 ? "s" : ""} in your portfolio
          </p>
        </div>
        <button
          onClick={handleNewDesign}
          className="cartoon-button flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b0664c] text-white text-sm font-bold"
        >
          <Plus className="h-4 w-4" />
          New Design
        </button>
      </motion.div>

      {userDesigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-24"
        > 
          <h2 className="font-display-cartoon text-2xl text-slate-700">No designs yet</h2>
          <p className="text-slate-400 text-sm mt-2 mb-6">Create your first room design to get started.</p>
          <button
            onClick={handleNewDesign}
            className="cartoon-button inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b0664c] text-white text-sm font-bold"
          >
            <Plus className="h-4 w-4" />
            Create First Design
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <button
              onClick={handleNewDesign}
              className="flex h-full min-h-55 w-full cursor-pointer flex-col items-center justify-center rounded-[24px] border-[3px] border-dashed border-slate-400 bg-transparent transition-all hover:border-slate-900 hover:bg-white/50 group"
            >
              <div className="h-12 w-12 rounded-xl border-2 border-slate-400 group-hover:border-slate-900 bg-white flex items-center justify-center mb-3 transition-colors">
                <Plus className="h-5 w-5 text-slate-400 group-hover:text-[#b0664c] transition-colors" />
              </div>
              <p className="text-sm font-bold text-slate-400 group-hover:text-slate-700 transition-colors">New Design</p>
              <p className="text-[11px] text-slate-300 mt-1">Start a fresh room layout</p>
            </button>
          </motion.div>

          {userDesigns
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((design, i) => (
              <motion.div key={design.id} initial="hidden" animate="visible" custom={i + 1} variants={fadeUp}>
                <div className="cartoon-frame overflow-hidden rounded-[24px] bg-white transition-all group hover:-translate-y-0.5"> 
                  <div className="relative h-32 bg-[#f7e7e1] overflow-hidden border-b-2 border-slate-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="border-2 border-slate-300 relative rounded-sm"
                        style={{
                          width: Math.min(design.room.width * 0.2, 120),
                          height: Math.min(design.room.height * 0.2, 80),
                          backgroundColor: design.room.floorColor,
                          opacity: 0.8,
                        }}
                      >
                        {design.items.slice(0, 6).map((item) => (
                          <div
                            key={item.instanceId}
                            className="absolute border border-black/15"
                            style={{
                              left: item.x * 0.2,
                              top: item.y * 0.2,
                              width: item.width * 0.2,
                              height: item.height * 0.2,
                              backgroundColor: item.color,
                              borderRadius: item.shapeType === "circle" ? "50%" : "2px",
                              opacity: item.opacity,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-bold text-slate-700 truncate">{design.room.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Ruler className="h-3 w-3" />
                        {design.room.width}×{design.room.height}
                      </span>
                      <span className="flex items-center gap-1">
                        <Box className="h-3 w-3" />
                        {design.items.length} items
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(design.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(design.id)}
                        className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-slate-900 text-xs font-bold text-slate-600 transition-all shadow-[0_2px_0_rgba(17,24,39,0.95)] hover:translate-y-px hover:bg-[#b0664c] hover:text-white hover:shadow-[0_1px_0_rgba(17,24,39,0.95)]"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>

                      <Dialog open={deleteId === design.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <DialogTrigger
                          onClick={() => setDeleteId(design.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-slate-900 text-slate-400 transition-all shadow-[0_2px_0_rgba(17,24,39,0.95)] hover:translate-y-px hover:bg-red-50 hover:text-red-500 hover:shadow-[0_1px_0_rgba(17,24,39,0.95)]"
                        >
                          <Trash2 className="h-3 w-3" />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete design?</DialogTitle>
                            <DialogDescription>
                              This will permanently remove &quot;{design.room.name}&quot;. This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}

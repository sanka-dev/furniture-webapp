"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { usePortfolioStore } from "@/lib/stores/portfolio-store";
import { useDesignStore } from "@/lib/stores/design-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Box, Pencil, Ruler, Sparkles } from "lucide-react";

export default function DesignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { getDesign, fetchDesignById } = usePortfolioStore();
  const loadDesign = useDesignStore((s) => s.loadDesign);
  const [hasCheckedRemote, setHasCheckedRemote] = useState(false);

  const designId = params.id as string;
  const design = getDesign(designId);

  useEffect(() => {
    setHasCheckedRemote(false);
  }, [designId]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    if (design) {
      setHasCheckedRemote(true);
      return;
    }

    let cancelled = false;
    const run = async () => {
      await fetchDesignById(user.id, designId);
      if (!cancelled) setHasCheckedRemote(true);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id, design, fetchDesignById, designId]);

  if (isLoading || (isAuthenticated && !design && !hasCheckedRemote)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24 cartoon-dot-grid bg-[#fff6ee]">
        <div className="text-center cartoon-frame rounded-[28px] bg-white px-10 py-12">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#b0664c]" />
          <p className="mt-4 text-sm font-medium text-slate-500">Loading design...</p>
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24 cartoon-dot-grid bg-[#fff6ee]">
        <div className="text-center cartoon-frame rounded-[28px] bg-white px-10 py-12">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-[#fef1e2] px-3 py-1 text-xs font-bold text-slate-700">
            <Sparkles className="h-3.5 w-3.5" />
            Oops
          </p>
          <h1 className="mt-4 font-display-cartoon text-3xl text-slate-900">Design not found</h1>
          <p className="text-slate-500 mt-2 text-sm">
            This design may have been deleted.
          </p>
          <Button
            variant="ghost"
            className="cartoon-button mt-5 rounded-full border-2 border-slate-900 bg-white px-5 text-sm font-bold text-slate-700"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    loadDesign(design);
    router.push(`/planner?edit=${designId}`);
  };

  return (
    <div className="min-h-screen px-6 pb-16 pt-28 cartoon-dot-grid bg-[radial-gradient(circle_at_20%_20%,#fff6ee,transparent_40%),radial-gradient(circle_at_80%_0%,#ffe8da,transparent_35%),#fffaf4]">
      <div className="mx-auto max-w-4xl">
        <div className="cartoon-frame mb-8 rounded-[30px] bg-white/95 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <button
                className="cartoon-button mb-3 inline-flex items-center rounded-full border-2 border-slate-900 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
              <h1 className="font-display-cartoon text-4xl leading-tight text-slate-900">{design.room.name}</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Last updated {new Date(design.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleEdit}
              className="cartoon-button inline-flex items-center rounded-full border-2 border-slate-900 bg-[#b0664c] px-5 py-2.5 text-sm font-bold text-white"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Design
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-900 bg-[#fff1e4] px-3 py-1.5">
              <Ruler className="h-3.5 w-3.5" />
              {design.room.width} x {design.room.height} cm
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-900 bg-[#ecf6ff] px-3 py-1.5">
              <Box className="h-3.5 w-3.5" />
              {design.items.length} furniture items
            </span>
            
          </div>
        </div>

        <div className="cartoon-frame rounded-[30px] bg-white p-5 sm:p-7">
          <h2 className="font-display-cartoon text-2xl text-slate-800">Room Preview</h2>
          <p className="mt-1 text-sm text-slate-500">A playful top-view snapshot of your current layout.</p>

          <div className="mt-6 rounded-[24px] border-2 border-dashed border-slate-300 bg-[#fff8ef] p-4 sm:p-6">
            <div className="flex items-center justify-center">
              <div
                className="relative overflow-hidden border-[3px] border-slate-900 bg-white shadow-[0_4px_0_rgba(17,24,39,0.95)]"
                style={{
                  width: Math.min(design.room.width * 0.7, 600),
                  height: Math.min(design.room.height * 0.7, 400),
                  backgroundColor: design.room.floorColor,
                  borderRadius: 14,
                }}
              >
                {design.items.map((item) => (
                  <div
                    key={item.instanceId}
                    className="absolute flex items-center justify-center overflow-hidden border-2 border-slate-900 px-1 text-[9px] font-bold text-slate-700"
                    style={{
                      left: item.x * 0.7,
                      top: item.y * 0.7,
                      width: item.width * 0.7,
                      height: item.height * 0.7,
                      backgroundColor: item.color,
                      borderRadius: item.shapeType === "circle" ? "999px" : "8px",
                      opacity: item.opacity,
                      transform: `rotate(${item.rotation}deg)`,
                      boxShadow: "0 2px 0 rgba(17,24,39,0.9)",
                    }}
                  >
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {design.items.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display-cartoon text-2xl text-slate-900">Furniture Items</h2>
            <p className="mt-1 text-sm text-slate-500">Every piece currently placed in this design.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {design.items.map((item) => (
                <div
                  key={item.instanceId}
                  className="cartoon-frame flex items-center gap-3 rounded-2xl bg-white px-3 py-3"
                >
                  <div
                    className="h-10 w-10 shrink-0 border-2 border-slate-900 shadow-[0_2px_0_rgba(17,24,39,0.95)]"
                    style={{
                      backgroundColor: item.color,
                      borderRadius: item.shapeType === "circle" ? "999px" : "10px",
                    }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">{item.name}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {item.width} x {item.height} cm
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

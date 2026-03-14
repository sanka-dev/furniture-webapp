"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useDesignStore } from "@/lib/stores/design-store";
import { usePortfolioStore } from "@/lib/stores/portfolio-store";
import { FurniturePanel } from "@/components/planner/furniture-panel";
import { PropertiesPanel } from "@/components/planner/properties-panel";
import { Toolbar } from "@/components/planner/toolbar";
import { LayoutGrid, Box, ZoomIn, ZoomOut } from "lucide-react";
import dynamic from "next/dynamic";

const RoomCanvas = dynamic(
  () => import("@/components/planner/room-canvas").then((m) => ({ default: m.RoomCanvas })),
  { ssr: false, loading: () => <CanvasLoader /> }
);

const RoomViewer3D = dynamic(
  () => import("@/components/planner/room-viewer-3d").then((m) => ({ default: m.RoomViewer3D })),
  { ssr: false, loading: () => <CanvasLoader /> }
);

function CanvasLoader() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#f7e7e1]" role="status" aria-label="Loading canvas">
      <div className="text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#b0664c] mx-auto mb-3" />
        <p className="text-xs text-slate-400 font-sans">Loading...</p>
      </div>
    </div>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}


function PaneLabel({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-slate-300/60 shadow-md pointer-events-none select-none">
      <Icon className="h-3.5 w-3.5 text-slate-500" />
      <span className="text-[11px] font-semibold text-slate-600 tracking-wide uppercase">{label}</span>
    </div>
  );
}


function PaneZoom({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-md border border-slate-300/60 rounded-xl px-1.5 py-1 shadow-md">
      <button
        onClick={onZoomOut}
        className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onReset}
        className="text-[11px] text-slate-500 hover:text-slate-900 font-mono font-semibold w-10 text-center transition-colors cursor-pointer"
        aria-label={`Zoom ${Math.round(zoom * 100)}%, click to reset`}
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={onZoomIn}
        className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}


function SplitView() {
  const [splitPercent, setSplitPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom2d, setZoom2d] = useState(0.75);
  const [zoom3d, setZoom3d] = useState(1.0); 

  const handleZoom2dIn = useCallback(() => setZoom2d((z) => Math.min(2.5, +(z + 0.1).toFixed(1))), []);
  const handleZoom2dOut = useCallback(() => setZoom2d((z) => Math.max(0.2, +(z - 0.1).toFixed(1))), []);
  const handleZoom2dReset = useCallback(() => setZoom2d(0.75), []);

  const handleZoom3dIn = useCallback(() => setZoom3d((z) => Math.min(2.0, +(z + 0.1).toFixed(1))), []);
  const handleZoom3dOut = useCallback(() => setZoom3d((z) => Math.max(0.3, +(z - 0.1).toFixed(1))), []);
  const handleZoom3dReset = useCallback(() => setZoom3d(1.0), []);


  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.min(80, Math.max(20, (x / rect.width) * 100));
      setSplitPercent(pct);
    };

    const handleMouseUp = () => setIsDragging(false);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div ref={containerRef} className="flex flex-1 h-full relative">

      <div className="relative flex flex-col h-full" style={{ width: `${splitPercent}%` }}>
        <RoomCanvas zoom={zoom2d} /> 
        <PaneZoom zoom={zoom2d} onZoomIn={handleZoom2dIn} onZoomOut={handleZoom2dOut} onReset={handleZoom2dReset} />
      </div>


      <div
        className="relative z-20 flex items-center justify-center group shrink-0"
        style={{ width: "12px", margin: "0 -6px", cursor: "col-resize" }}
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(splitPercent)}
        aria-valuemin={20}
        aria-valuemax={80}
        aria-label="Resize split view"
        tabIndex={0}
      >
        <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 transition-all duration-150 ${
          isDragging ? "bg-[#b0664c]/60 shadow-[0_0_8px_rgba(176,102,76,0.3)]" : "bg-slate-300 group-hover:bg-slate-400"
        }`} />

        <div className={`relative z-10 flex flex-col items-center justify-center gap-0.75 h-10 w-5 rounded-full border transition-all duration-150 ${
          isDragging
            ? "bg-[#b0664c]/15 border-[#b0664c]/40 shadow-[0_0_12px_rgba(176,102,76,0.15)]"
            : "bg-white border-slate-300 group-hover:bg-[#f7e7e1] group-hover:border-slate-400"
        }`}>
          <div className="w-0.75 h-0.75 rounded-full bg-slate-400" />
          <div className="w-0.75 h-0.75 rounded-full bg-slate-400" />
          <div className="w-0.75 h-0.75 rounded-full bg-slate-400" />
        </div>
      </div>

      <div className="relative flex flex-col h-full" style={{ width: `${100 - splitPercent}%` }}>
        <RoomViewer3D fov={zoom3d} /> 
        <PaneZoom zoom={zoom3d} onZoomIn={handleZoom3dIn} onZoomOut={handleZoom3dOut} onReset={handleZoom3dReset} />
      </div>
    </div>
  );
}

function PlannerContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { viewMode, loadDesign, room, panOffset, setPanOffset, selectedItemId, selectItem, items, cameraMode, setCameraMode } = useDesignStore();
  const { getDesign } = usePortfolioStore();
  const [zoom, setZoom] = useState(0.75);
  const [loaded, setLoaded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [bottomOpen, setBottomOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const handleToggleCameraMode = useCallback(() => {
    if (cameraMode === "walk") {
      setCameraMode("orbit");
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    } else {
      setCameraMode("walk");
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        canvas?.requestPointerLock();
      }, 100);
    }
  }, [cameraMode, setCameraMode]);

  useEffect(() => {
    if (isMobile) { setBottomOpen(false); setRightOpen(false); }
  }, [isMobile]);

  useEffect(() => {
    if (editId && !loaded) {
      const design = getDesign(editId);
      if (design) loadDesign(design);
      setLoaded(true);
    }
  }, [editId, loaded, getDesign, loadDesign]);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(1))), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(0.2, +(z - 0.1).toFixed(1))), []);
  const handleZoomReset = useCallback(() => setZoom(0.75), []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) handleZoomIn();
        else handleZoomOut();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [handleZoomIn, handleZoomOut]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const isWalkMode = cameraMode === "walk";

      if (!isWalkMode) {
        const panSpeed = e.shiftKey ? 50 : 20;
        if (e.key === "w" || e.key === "W") {
          e.preventDefault();
          setPanOffset({ x: panOffset.x, y: panOffset.y + panSpeed });
          return;
        }
        if (e.key === "a" || e.key === "A") {
          e.preventDefault();
          setPanOffset({ x: panOffset.x + panSpeed, y: panOffset.y });
          return;
        }
        if ((e.key === "s" || e.key === "S") && !e.ctrlKey) {
          e.preventDefault();
          setPanOffset({ x: panOffset.x, y: panOffset.y - panSpeed });
          return;
        }
        if (e.key === "d" || e.key === "D") {
          e.preventDefault();
          setPanOffset({ x: panOffset.x - panSpeed, y: panOffset.y });
          return;
        }
      }

      if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        useDesignStore.getState().setRoom({ showGrid: !room.showGrid });
        return;
      }

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        useDesignStore.getState().setRoom({ snapToGrid: !room.snapToGrid });
        return;
      }
      
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedItemId) {
          const it = items.find((i) => i.instanceId === selectedItemId);
          if (it && !it.locked) useDesignStore.getState().removeItem(selectedItemId);
        }
      }
      
      if (e.ctrlKey && e.key === "z") useDesignStore.getState().undo();
      if (e.ctrlKey && e.key === "y") useDesignStore.getState().redo();
      
      if (e.key === "Escape") selectItem(null);
      



      if (selectedItemId) {
        const nudge = e.shiftKey ? 10 : 1;
        const it = items.find((i) => i.instanceId === selectedItemId);
        if (!it || it.locked) return;
        if (e.key === "ArrowLeft") { e.preventDefault(); useDesignStore.getState().updateItem(selectedItemId, { x: it.x - nudge }); }
        if (e.key === "ArrowRight") { e.preventDefault(); useDesignStore.getState().updateItem(selectedItemId, { x: it.x + nudge }); }
        if (e.key === "ArrowUp") { e.preventDefault(); useDesignStore.getState().updateItem(selectedItemId, { y: it.y - nudge }); }
        if (e.key === "ArrowDown") { e.preventDefault(); useDesignStore.getState().updateItem(selectedItemId, { y: it.y + nudge }); }
      }
    };


    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panOffset, setPanOffset, room.showGrid, room.snapToGrid, selectedItemId, selectItem, items, cameraMode]);

  return (
    <div className="flex h-screen flex-col bg-[#f7e7e1] font-sans" role="application" aria-label="Caza Room Planner">
      <Toolbar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        editId={editId}
        rightOpen={rightOpen}
        onToggleRight={() => setRightOpen(!rightOpen)}
        cameraMode={cameraMode}
        onToggleCameraMode={handleToggleCameraMode}
      />

      <div className="flex flex-1 overflow-hidden relative">

        <div className="flex flex-col flex-1 overflow-hidden relative">

          <div className="flex flex-1 overflow-hidden relative" role="main" aria-label="Design canvas">
            {viewMode === "split" ? (
              <SplitView />
            ) : viewMode === "2d" ? (
              <RoomCanvas zoom={zoom} />
            ) : (
              <RoomViewer3D />
            )}
          </div>


          <div className="absolute bottom-0 left-0 right-0 z-20">
            <FurniturePanel
              collapsed={!bottomOpen}
              onToggle={() => setBottomOpen(!bottomOpen)}
            />
          </div>
        </div>


        {isMobile && rightOpen && (
          <div
            className="absolute inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setRightOpen(false)}
            aria-hidden="true"
          />
        )}
        <aside
          className="absolute right-0 top-0 bottom-0 z-40 p-2.5"
          role="complementary"
          aria-label="Item properties"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <PropertiesPanel
            collapsed={!rightOpen}
            onToggle={() => setRightOpen(!rightOpen)}
          />
        </aside>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<CanvasLoader />}>
      <PlannerContent />
    </Suspense>
  );
}

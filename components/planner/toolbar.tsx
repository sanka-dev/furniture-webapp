"use client";

import Link from "next/link";
import { useDesignStore } from "@/lib/stores/design-store";
import { usePortfolioStore } from "@/lib/stores/portfolio-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { type CinematicOptions, type CinematicPathPoint } from "@/components/planner/room-viewer-3d";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Armchair,
  Undo2,
  Redo2,
  Save,
  Trash2,
  ZoomIn,
  ZoomOut,
  Box,
  LayoutGrid,
  Check,
  Columns2,
  PanelRightClose,
  PanelRightOpen,
  Grid3x3,
  Lightbulb,
  LightbulbOff,
  Move,
  RotateCw,
  Maximize2,
  Eye,
  MousePointer2,
  Clapperboard,
  X,
  FileText,
} from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";

interface ToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  editId?: string | null;
  bottomOpen: boolean;
  onToggleBottom: () => void;
  rightOpen: boolean;
  onToggleRight: () => void;
  cameraMode?: "orbit" | "walk";
  onToggleCameraMode?: () => void;
  cinematicActive?: boolean;
  cinematicOptions: CinematicOptions;
  onStartCinematic?: (options: CinematicOptions) => void;
}

function TBtn({
  onClick,
  tooltip,
  children,
  active,
  className,
  ariaLabel,
  disabled = false,
}: {
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        className={`inline-flex items-center justify-center h-9 w-9 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white border-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
          active
            ? "bg-[#b0664c] text-white border-slate-900 shadow-md"
            : "text-slate-700 bg-white border-slate-300 hover:bg-[#f7e7e1] hover:border-slate-400"
        } ${className || ""}`}
        onClick={onClick}
        aria-label={ariaLabel || tooltip}
        aria-pressed={active}
        disabled={disabled}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-sm font-medium bg-slate-900 border-2 border-slate-700 text-white shadow-xl">{tooltip}</TooltipContent>
    </Tooltip>
  );
}


function SaveDialog({
  open,
  onClose,
  onSave,
  defaultName,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName: string;
  saving: boolean;
}) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [open, defaultName]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center font-sans" role="dialog" aria-modal="true" aria-label="Save design">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="rounded-2xl overflow-hidden bg-white border-2 border-slate-900 shadow-2xl">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 rounded-xl bg-[#f7e7e1] hover:bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-[#b0664c]/10 border-2 border-[#b0664c]/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#b0664c]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Save Design</h2>
                <p className="text-sm text-slate-500 mt-0.5">Give your design a memorable name</p>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="design-name" className="text-sm text-slate-700 font-semibold mb-2 block">
                Design Name
              </label>
              <input
                ref={inputRef}
                id="design-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) onSave(name.trim());
                  if (e.key === "Escape") onClose();
                }}
                placeholder="e.g., Living Room Concept"
                className="w-full h-12 px-4 rounded-xl bg-[#f7e7e1] border-2 border-slate-300 hover:border-slate-400 focus:border-[#b0664c] text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-[#b0664c]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                autoFocus
                aria-required="true"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-xl bg-[#f7e7e1] border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Cancel
              </button>
              <button
                onClick={() => name.trim() && onSave(name.trim())}
                disabled={!name.trim() || saving}
                className="flex-1 h-11 rounded-xl bg-[#b0664c] text-white font-bold text-sm hover:bg-[#9c5843] border-2 border-slate-900 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Design
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CinematicDialog({
  open,
  onClose,
  onStart,
  options,
  hasSelectedItem,
  active,
}: {
  open: boolean;
  onClose: () => void;
  onStart: (options: CinematicOptions) => void;
  options: CinematicOptions;
  hasSelectedItem: boolean;
  active: boolean;
}) {
  const [draft, setDraft] = useState<CinematicOptions>(options);
  const [isDrawingPath, setIsDrawingPath] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(options);
      setIsDrawingPath(false);
    }
  }, [open, options]);

  useEffect(() => {
    if (!hasSelectedItem && draft.focusMode === "selected") {
      setDraft((current) => ({ ...current, focusMode: "room" }));
    }
  }, [draft.focusMode, hasSelectedItem]);

  const toNormalizedPoint = useCallback((event: React.PointerEvent<HTMLDivElement>): CinematicPathPoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    return { x, y };
  }, []);

  const appendDrawnPoint = useCallback((point: CinematicPathPoint) => {
    setDraft((current) => {
      const previous = current.drawnPath[current.drawnPath.length - 1];
      const distance = previous ? Math.hypot(previous.x - point.x, previous.y - point.y) : Number.POSITIVE_INFINITY;
      if (distance < 0.025) {
        return current;
      }
      return {
        ...current,
        drawnPath: [...current.drawnPath, point].slice(0, 24),
      };
    });
  }, []);

  const pathPolyline = draft.drawnPath.map((point) => `${point.x * 100},${point.y * 100}`).join(" ");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center font-sans" role="dialog" aria-modal="true" aria-label="Cinematic settings">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="rounded-2xl overflow-hidden bg-white border-2 border-slate-900 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 rounded-xl bg-[#f7e7e1] hover:bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60"
            aria-label="Close cinematic settings"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-[#b0664c]/10 border-2 border-[#b0664c]/30 flex items-center justify-center">
                <Clapperboard className="h-6 w-6 text-[#b0664c]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Cinematic Capture</h2>
                <p className="text-sm text-slate-500 mt-0.5">Draw a simple path or fall back to guided camera routing</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-700 font-semibold">Draw Camera Path</p>
                  <button
                    type="button"
                    onClick={() => setDraft((current) => ({ ...current, drawnPath: [] }))}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Clear Path
                  </button>
                </div>
                <div
                  className={`relative h-44 rounded-2xl border-2 border-dashed ${isDrawingPath ? "border-[#b0664c] bg-[#fff5f0]" : "border-slate-300 bg-[#f7e7e1]"} overflow-hidden touch-none cursor-crosshair`}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setIsDrawingPath(true);
                    const point = toNormalizedPoint(event);
                    setDraft((current) => ({ ...current, drawnPath: [point] }));
                  }}
                  onPointerMove={(event) => {
                    if (!isDrawingPath) return;
                    appendDrawnPoint(toNormalizedPoint(event));
                  }}
                  onPointerUp={(event) => {
                    if (!isDrawingPath) return;
                    appendDrawnPoint(toNormalizedPoint(event));
                    setIsDrawingPath(false);
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }}
                  onPointerLeave={() => setIsDrawingPath(false)}
                >
                  <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)", backgroundSize: "25% 25%" }} />
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                    {pathPolyline && (
                      <polyline
                        points={pathPolyline}
                        fill="none"
                        stroke="#b0664c"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {draft.drawnPath.map((point, index) => (
                      <g key={`${point.x}-${point.y}-${index}`}>
                        <circle cx={point.x * 100} cy={point.y * 100} r={index === 0 || index === draft.drawnPath.length - 1 ? 2.4 : 1.6} fill={index === 0 ? "#1d4ed8" : index === draft.drawnPath.length - 1 ? "#b91c1c" : "#0f172a"} />
                      </g>
                    ))}
                  </svg>
                  {draft.drawnPath.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-500 font-medium">
                      Press and drag here to draw the camera route
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Blue is the start, red is the end. If you don’t draw a path, the preset path is used.</p>
              </div>

              <div>
                <p className="text-sm text-slate-700 font-semibold mb-2">Camera Preset</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "showcase", label: "Showcase" },
                    { key: "sweep", label: "Sweep" },
                    { key: "detail", label: "Detail" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDraft((current) => ({ ...current, preset: key as CinematicOptions["preset"] }))}
                      className={`h-10 rounded-xl border-2 text-sm font-semibold transition-all ${draft.preset === key ? "bg-[#b0664c] text-white border-slate-900 shadow-md" : "bg-[#f7e7e1] text-slate-700 border-slate-300 hover:bg-slate-100"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-700 font-semibold">Duration</p>
                  <span className="text-sm text-slate-500 font-mono">{(draft.durationMs / 1000).toFixed(0)}s</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={24}
                  step={2}
                  value={draft.durationMs / 1000}
                  onChange={(e) => setDraft((current) => ({ ...current, durationMs: Number(e.target.value) * 1000 }))}
                  className="w-full accent-[#b0664c]"
                  aria-label="Cinematic duration"
                />
              </div>

              <details className="rounded-xl border border-slate-200 bg-[#fcfaf8] px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">Advanced guided path</summary>
                <div className="mt-4 space-y-3">
                  {([
                    { label: "Point 1", index: 0 },
                    { label: "Point 2", index: 1 },
                    { label: "Point 3", index: 2 },
                    { label: "Point 4", index: 3 },
                  ] as const).map(({ label, index }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm text-slate-700 font-semibold">{label}</p>
                        <span className="text-sm text-slate-500 font-mono">{draft.pathAnglesDeg[index]}°</span>
                      </div>
                      <input
                        type="range"
                        min={-120}
                        max={120}
                        step={5}
                        value={draft.pathAnglesDeg[index]}
                        onChange={(e) => {
                          const nextAngles = [...draft.pathAnglesDeg] as CinematicOptions["pathAnglesDeg"];
                          nextAngles[index] = Number(e.target.value);
                          setDraft((current) => ({ ...current, pathAnglesDeg: nextAngles }));
                        }}
                        className="w-full accent-[#b0664c]"
                        aria-label={`${label} camera angle`}
                      />
                    </div>
                  ))}
                </div>
              </details>

              <div>
                <p className="text-sm text-slate-700 font-semibold mb-2">Focus Target</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft((current) => ({ ...current, focusMode: "room" }))}
                    className={`h-10 rounded-xl border-2 text-sm font-semibold transition-all ${draft.focusMode === "room" ? "bg-[#b0664c] text-white border-slate-900 shadow-md" : "bg-[#f7e7e1] text-slate-700 border-slate-300 hover:bg-slate-100"}`}
                  >
                    Whole Room
                  </button>
                  <button
                    type="button"
                    onClick={() => hasSelectedItem && setDraft((current) => ({ ...current, focusMode: "selected" }))}
                    disabled={!hasSelectedItem}
                    className={`h-10 rounded-xl border-2 text-sm font-semibold transition-all ${draft.focusMode === "selected" ? "bg-[#b0664c] text-white border-slate-900 shadow-md" : "bg-[#f7e7e1] text-slate-700 border-slate-300 hover:bg-slate-100"} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Selected Item
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-700 font-semibold mb-2">Output Format</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "auto", label: "Auto" },
                    { key: "mp4", label: "Prefer MP4" },
                    { key: "webm", label: "WebM" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDraft((current) => ({ ...current, formatPreference: key as CinematicOptions["formatPreference"] }))}
                      className={`h-10 rounded-xl border-2 text-sm font-semibold transition-all ${draft.formatPreference === key ? "bg-[#b0664c] text-white border-slate-900 shadow-md" : "bg-[#f7e7e1] text-slate-700 border-slate-300 hover:bg-slate-100"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-xl bg-[#f7e7e1] border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 text-sm font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => onStart(draft)}
                disabled={active}
                className="flex-1 h-11 rounded-xl bg-[#b0664c] text-white font-bold text-sm hover:bg-[#9c5843] border-2 border-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {active ? "Recording..." : "Start Cinematic"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Toolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  editId,
  bottomOpen,
  onToggleBottom,
  rightOpen,
  onToggleRight,
  cameraMode,
  onToggleCameraMode,
  cinematicActive = false,
  cinematicOptions,
  onStartCinematic,
}: ToolbarProps) {
  const {
    undo,
    redo,
    viewMode,
    setViewMode,
    clearDesign,
    getDesignSnapshot,
    room,
    setRoom,
    selectedItemId,
    historyIndex,
    history,
    transformMode,
    setTransformMode,
  } = useDesignStore();
  const { saveDesign, updateDesign } = usePortfolioStore();
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showCinematicDialog, setShowCinematicDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const [savedDesignId, setSavedDesignId] = useState<string | null>(editId || null);

  useEffect(() => {
    if (editId) setSavedDesignId(editId);
  }, [editId]);

  const handleSaveClick = useCallback(() => {
    if (!user) return;

    if (savedDesignId) {
      const snapshot = getDesignSnapshot(user.id);
      updateDesign(savedDesignId, snapshot);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {

      setShowSaveDialog(true);
    }
  }, [user, savedDesignId, getDesignSnapshot, updateDesign]);

  const handleFirstSave = useCallback(async (designName: string) => {
    if (!user) return;
    setSaving(true);

    useDesignStore.getState().setRoom({ name: designName });

    await new Promise((r) => setTimeout(r, 50));

    const snapshot = getDesignSnapshot(user.id);
    const result = await saveDesign(snapshot);

    setSaving(false);

    if (result.success) {
      setSavedDesignId(snapshot.id);
      setShowSaveDialog(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }, [user, getDesignSnapshot, saveDesign]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <>
      <nav
        className="bg-white border-b-2 border-slate-900 px-3 py-2.5 font-sans shadow-sm overflow-x-auto overflow-y-hidden"
        role="toolbar"
        aria-label="Planner toolbar"
      >
        <div className="flex min-w-max items-center gap-3 md:min-w-0 md:w-full md:justify-between">
        <div className="flex items-center gap-2"> 
          <Link
            href="/"
            className="flex items-center gap-2 mr-3 group"
            aria-label="Go to Caza home page"
          > 
            <span className="hidden sm:inline text-sm font-bold text-slate-800 group-hover:text-slate-600 transition-colors">
              Caza
            </span>
          </Link>

          <div className="w-px h-6 bg-slate-300" aria-hidden="true" />

          <TBtn onClick={undo} tooltip="Undo (Ctrl+Z)" disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
          </TBtn>
          <TBtn onClick={redo} tooltip="Redo (Ctrl+Y)" disabled={!canRedo}>
            <Redo2 className="h-4 w-4" />
          </TBtn>

          <div className="w-px h-6 bg-slate-300 mx-1" aria-hidden="true" />

          <TBtn onClick={() => setRoom({ showGrid: !room.showGrid })} tooltip="Toggle Grid (G)" active={room.showGrid}>
            <Grid3x3 className="h-4 w-4" />
          </TBtn>
          

          <div className="w-px h-6 bg-slate-300 mx-1" aria-hidden="true" />

          <TBtn
            onClick={() => setRoom({ lightsOn: !room.lightsOn })}
            tooltip={room.lightsOn ? "Turn Lights Off (L)" : "Turn Lights On (L)"}
            active={room.lightsOn}
            ariaLabel="Toggle room lights"
          >
            {room.lightsOn ? <Lightbulb className="h-4 w-4" /> : <LightbulbOff className="h-4 w-4" />}
          </TBtn>

          <TBtn
            onClick={() => setRoom({ renderProfile: room.renderProfile === "cozy" ? "default" : "cozy" })}
            tooltip={room.renderProfile === "cozy" ? "Switch to Neutral Lighting" : "Switch to Cozy Lighting"}
            active={room.renderProfile === "cozy"}
            ariaLabel="Toggle lighting style"
          >
            <span className="text-[9px] font-black tracking-wide">MOOD</span>
          </TBtn>

          <TBtn
            onClick={() => setRoom({ postFxEnabled: !room.postFxEnabled })}
            tooltip={room.postFxEnabled ? "Disable Post FX" : "Enable Post FX"}
            active={room.postFxEnabled}
            ariaLabel="Toggle postprocessing effects"
          >
            <span className="text-[10px] font-black">FX</span>
          </TBtn>

          {(viewMode === "3d" || viewMode === "split") && (
            <>
              <div className="w-px h-6 bg-slate-300 mx-1" aria-hidden="true" />
              <div
                className="flex items-center bg-[#f7e7e1] rounded-xl p-1 border-2 border-slate-300 gap-1"
                role="radiogroup"
                aria-label="3D transform mode"
              >
                {([
                  { mode: "translate" as const, icon: Move, label: "Move" },
                  { mode: "rotate" as const, icon: RotateCw, label: "Rotate" },
                  { mode: "scale" as const, icon: Maximize2, label: "Scale" },
                ]).map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    role="radio"
                    aria-checked={transformMode === mode}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                      transformMode === mode
                        ? "bg-[#b0664c] text-white border-2 border-slate-900"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white border-2 border-transparent"
                    }`}
                    onClick={() => setTransformMode(mode)}
                    title={label}
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
              
              {onToggleCameraMode && (
                <>
                  <div className="w-px h-6 bg-slate-300 mx-1" aria-hidden="true" />
                  <TBtn
                    onClick={onToggleCameraMode}
                    tooltip={cameraMode === "walk" ? "Orbit Mode" : "Walk Inside"}
                    active={cameraMode === "walk"}
                    ariaLabel="Toggle camera mode"
                  >
                    {cameraMode === "walk" ? <MousePointer2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </TBtn>

                  <TBtn
                    onClick={() => setShowCinematicDialog(true)}
                    tooltip={cinematicActive ? "Recording Cinematic..." : "Create Cinematic Video"}
                    active={cinematicActive}
                    ariaLabel="Create cinematic room video"
                    disabled={!onStartCinematic}
                  >
                    <Clapperboard className="h-4 w-4" />
                  </TBtn>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center bg-[#f7e7e1] rounded-xl p-1 border-2 border-slate-300 gap-1"
            role="radiogroup"
            aria-label="View mode"
          >
            {[
              { mode: "2d" as const, label: "2D", icon: LayoutGrid },
              { mode: "3d" as const, label: "3D", icon: Box },
              { mode: "split" as const, label: "Split", icon: Columns2 },
            ].map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                role="radio"
                aria-checked={viewMode === mode}
                className={`h-8 rounded-xl text-sm font-semibold px-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white flex items-center gap-1.5 ${
                  viewMode === mode
                    ? "bg-[#b0664c] text-white shadow-md border-2 border-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white border-2 border-transparent"
                }`}
                onClick={() => setViewMode(mode)}
                aria-label={`Switch to ${label} view`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

   

          <div className="flex items-center gap-1 bg-[#f7e7e1] rounded-xl px-2 py-1 border-2 border-slate-300">
            <TBtn onClick={onZoomOut} tooltip="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </TBtn>
            <button
              onClick={onZoomReset}
              className="text-sm text-slate-700 font-mono font-semibold w-14 text-center cursor-pointer transition-colors hover:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60 rounded px-2 py-1"
              aria-label={`Zoom ${Math.round(zoom * 100)}%, click to reset to 100%`}
            >
              {Math.round(zoom * 100)}%
            </button>
            <TBtn onClick={onZoomIn} tooltip="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </TBtn>
          </div>
        </div>

        <div className="flex items-center gap-2">
          

         

          <div className="w-px h-6 bg-slate-300 mx-1" aria-hidden="true" />

          <button
            className={`inline-flex items-center gap-2 h-10 rounded-xl text-sm font-bold px-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white border-2 ${
              saved
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 focus-visible:ring-emerald-400"
                : user
                  ? "bg-[#b0664c] text-white hover:bg-[#9c5843] border-slate-900 shadow-md focus-visible:ring-[#b0664c]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
            }`}
            onClick={handleSaveClick}
            disabled={!user}
            aria-label={saved ? "Design saved" : savedDesignId ? "Update design" : "Save design"}
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                {savedDesignId ? "Update" : "Save"}
              </>
            )}
          </button>
        
        </div>
        </div>
      </nav>


      <SaveDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleFirstSave}
        defaultName={room.name}
        saving={saving}
      />

      <CinematicDialog
        open={showCinematicDialog}
        onClose={() => setShowCinematicDialog(false)}
        onStart={(options) => {
          onStartCinematic?.(options);
          setShowCinematicDialog(false);
        }}
        options={cinematicOptions}
        hasSelectedItem={Boolean(selectedItemId)}
        active={cinematicActive}
      />
    </>
  );
}

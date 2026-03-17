"use client";

import { useDesignStore } from "@/lib/stores/design-store";
import { FURNITURE_CATALOG } from "@/lib/data/furniture";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createId } from "@/lib/utils";
import {
  Trash2,
  RotateCw,
  Copy,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Move,
  Palette,
  Sun,
  Layers,
  MousePointer2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useState } from "react";

const QUICK_COLORS = [
  "#1a1a1a", "#2d2d2d", "#4a4a4a", "#6b6b6b", "#8b8b8b",
  "#a0845c", "#8b7355", "#5c4033", "#d4a574", "#c4a882",
  "#e8e0d4", "#d4c5b0", "#c4b5a0", "#f5f5f5", "#ffffff",
];

function Section({
  icon: Icon,
  label,
  right,
  children,
  defaultOpen = true,
  disabled = false,
}: {
  icon: typeof Move;
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl bg-[#f7e7e1] border border-slate-200 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2.5 cursor-pointer select-none hover:bg-slate-100 transition-colors ${open ? "rounded-t-2xl" : "rounded-2xl"}`}
        aria-expanded={open}
        aria-controls={`section-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
          <span className="flex items-center gap-2 text-[11px] text-slate-600 font-semibold uppercase tracking-wider">
            <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          {label}
        </span>
        <div className="flex items-center gap-2">
          {right}
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-300 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
            aria-hidden="true"
          />
        </div>
      </button>
      <div
        id={`section-${label.toLowerCase().replace(/\s+/g, '-')}`}
        className={`transition-all duration-200 ${open ? "max-h-150 opacity-100 overflow-visible" : "max-h-0 opacity-0 overflow-hidden"}`}
        role="region"
        aria-label={label}
      >
        <div className="px-3 pb-3">{children}</div>
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  children,
  variant = "default",
  className = "",
  ariaLabel,
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "danger" | "primary";
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const base =
    "h-9 rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]";
  const variants = {
    default:
      "bg-[#f7e7e1] border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300",
    primary:
      "bg-[#b0664c] border border-slate-900 text-white hover:bg-[#9c5843] focus-visible:ring-[#b0664c]/50",
    danger:
      "bg-red-50 border border-red-300 text-red-500 hover:bg-red-100 hover:text-red-600 focus-visible:ring-red-400/40",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

interface PropertiesPanelProps {
  collapsed: boolean;
  onToggle: () => void;
}


function ToggleTab({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="absolute -left-10 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2 w-10 py-5 rounded-l-2xl bg-white border-2 border-r-0 border-slate-900 text-slate-700 hover:bg-[#f7e7e1] transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60"
      aria-label={collapsed ? "Show properties panel (P)" : "Hide properties panel (P)"}
      aria-expanded={!collapsed}
      title={collapsed ? "Show properties panel (P)" : "Hide properties panel (P)"}
    >
      {collapsed ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      <span className="rounded-md border border-slate-300 bg-[#f7e7e1] px-1.5 py-0.5 text-[9px] font-black leading-none text-slate-600">
        P
      </span>
      <span className="text-[10px] font-bold tracking-widest [writing-mode:vertical-lr] rotate-180">
        {collapsed ? "SHOW" : "HIDE"}
      </span>
    </button>
  );
}

export function PropertiesPanel({ collapsed, onToggle }: PropertiesPanelProps) {
  const {
    items,
    selectedItemId,
    updateItem,
    removeItem,
    addItem,
    pushHistory,
    bringForward,
    sendBackward,
  } = useDesignStore();

  const selectedItem = items.find((i) => i.instanceId === selectedItemId);
  const selectedCatalogItem = selectedItem
    ? FURNITURE_CATALOG.find((e) => e.id === selectedItem.catalogId)
    : undefined;
  const hasCustomModel = Boolean(selectedCatalogItem?.modelUrl);

  if (!selectedItem) {
    return (
      <div className="relative h-full font-sans">
        <ToggleTab collapsed={collapsed} onToggle={onToggle} />
        {!collapsed && (
          <div className="w-70 h-full bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-lg" role="complementary" aria-label="Properties panel">
            <div className="flex flex-col h-full">
              <div className="px-5 py-4 border-b border-slate-200 bg-[#f7e7e1] rounded-t-[calc(1.5rem-2px)]">
                <h2 className="text-sm font-bold text-slate-800">Properties</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Select an item to edit</p>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-[#f7e7e1] border border-slate-200 flex items-center justify-center mb-5">
                  <MousePointer2 className="h-7 w-7 text-slate-300" aria-hidden="true" />
                </div>
                <h3 className="text-xs font-semibold text-slate-500 mb-1">No Item Selected</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-50">
                  Click on a furniture item in the canvas to edit
                </p>

                {items.length > 0 && (
                  <div className="mt-6 w-full">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Items ({items.length})
                      </span>
                    </div>
                    <ScrollArea className="max-h-45">
                      <div className="space-y-1">
                        {items.map((item) => (
                          <button
                            key={item.instanceId}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-[#f7e7e1] active:bg-slate-100 transition-all duration-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#b0664c]/40 group"
                            onClick={() => useDesignStore.getState().selectItem(item.instanceId)}
                            aria-label={`Select ${item.name}`}
                          >
                            <div
                              className="h-7 w-7 shrink-0 border border-white/15 shadow-sm"
                              style={{
                                backgroundColor: item.color,
                                borderRadius: item.shapeType === "circle" ? "50%" : "6px",
                              }}
                              aria-hidden="true"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-slate-700 font-medium truncate">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{item.width}×{item.height}</p>
                            </div>
                            {item.locked && <Lock className="h-3 w-3 text-amber-400/60 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isLocked = selectedItem.locked;
  const update = (updates: Partial<typeof selectedItem>) => {
    updateItem(selectedItem.instanceId, updates);
  };
  const commitChange = () => pushHistory();
  const handleDuplicate = () => {
    addItem({
      ...selectedItem,
      instanceId: createId("item"),
      x: selectedItem.x + 20,
      y: selectedItem.y + 20,
    });
  };

  return (
    <div className="relative h-full font-sans">
      <ToggleTab collapsed={collapsed} onToggle={onToggle} />
      {!collapsed && (
        <div className="w-70 h-full bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-lg" role="complementary" aria-label="Properties panel">
          <ScrollArea className="h-full">
            <div className="flex flex-col h-full"> 
              <div className="px-4 py-3 border-b border-slate-200 bg-[#f7e7e1] sticky top-0 z-10 rounded-t-[calc(1.5rem-2px)]">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">{selectedItem.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {selectedItem.width}×{selectedItem.height} cm · {selectedItem.rotation}°
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-90 ${
                        isLocked
                          ? "bg-amber-50 border border-amber-300 text-amber-600"
                          : "bg-[#f7e7e1] border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      }`}
                      onClick={() => { update({ locked: !isLocked }); commitChange(); }}
                      aria-label={isLocked ? "Unlock item" : "Lock item"}
                      aria-pressed={isLocked}
                    >
                      {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      className="h-8 w-8 rounded-full flex items-center justify-center bg-[#f7e7e1] border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 active:scale-90"
                      onClick={() => removeItem(selectedItem.instanceId)}
                      aria-label={`Delete ${selectedItem.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {isLocked && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                    <Lock className="h-3 w-3 shrink-0" />
                    Item locked — unlock to edit properties
                  </div>
                )}
              </div>


              <div className="p-3 space-y-2">


                <Section icon={Move} label="Position" disabled={isLocked}>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { label: "X", key: "x" as const },
                      { label: "Y", key: "y" as const },

                    ] as const).map(({ label, key }) => (
                      <div key={key}>
                        <Label htmlFor={`input-${key}`} className="text-[10px] text-slate-400 font-medium mb-1 block">
                          {label}
                        </Label>
                        <div className="relative">
                          <Input
                            id={`input-${key}`}
                            type="number"
                            value={Math.round(selectedItem[key])}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              update({ [key]: val });
                            }}
                            onBlur={commitChange}
                            className="h-8 text-xs pr-8 bg-white border border-slate-200 hover:border-slate-300 focus:border-[#b0664c] text-slate-800 rounded-lg font-mono transition-all"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none font-mono">
                            cm
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>



                {hasCustomModel && (
                  <Section
                    icon={Move}
                    label="Model Size"
                    disabled={isLocked}
                    right={
                      <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                        {(selectedItem.modelScale ?? 1).toFixed(2)}x
                      </span>
                    }
                  >
                    <Slider
                      value={[selectedItem.modelScale ?? 1]}
                      onValueChange={(v) => update({ modelScale: Array.isArray(v) ? v[0] : v })}
                      onValueCommitted={commitChange}
                      min={0.2}
                      max={3}
                      step={0.05}
                      className="mb-3"
                      aria-label="Model size scale"
                    />
                    <div className="grid grid-cols-4 gap-1" role="group" aria-label="Model size presets">
                      {[0.5, 1, 1.5, 2].map((scale) => (
                        <button
                          key={scale}
                          className={`h-7 rounded-lg text-[10px] font-semibold transition-all duration-100 active:scale-95 ${
                            Math.abs((selectedItem.modelScale ?? 1) - scale) < 0.03
                              ? "bg-[#b0664c] text-white shadow-sm"
                              : "bg-white text-slate-500 border border-slate-200 hover:bg-[#f7e7e1] hover:text-slate-700"
                          }`}
                          onClick={() => { update({ modelScale: scale }); commitChange(); }}
                          aria-label={`${scale}x`}
                        >
                          {scale}x
                        </button>
                      ))}
                    </div>
                  </Section>
                )}


                <Section
                  icon={RotateCw}
                  label="Rotation"
                  disabled={isLocked}
                  right={
                    <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                      {selectedItem.rotation}°
                    </span>
                  }
                >
                  <Slider
                    value={[selectedItem.rotation]}
                    onValueChange={(v) => update({ rotation: Array.isArray(v) ? v[0] : v })}
                    onValueCommitted={commitChange}
                    max={360}
                    step={5}
                    className="mb-3"
                    aria-label="Rotation angle"
                  />
                  <div className="grid grid-cols-6 gap-1" role="group" aria-label="Rotation presets">
                    {[0, 45, 90, 135, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        className={`h-7 rounded-lg text-[10px] font-semibold transition-all duration-100 active:scale-95 ${
                          selectedItem.rotation === deg
                            ? "bg-[#b0664c] text-white shadow-sm"
                            : "bg-white text-slate-500 border border-slate-200 hover:bg-[#f7e7e1] hover:text-slate-700"
                        }`}
                        onClick={() => { update({ rotation: deg }); commitChange(); }}
                        aria-label={`${deg}°`}
                        aria-pressed={selectedItem.rotation === deg}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </Section>


                <Section icon={Palette} label="Color" disabled={isLocked}>
                  <div className="flex items-center gap-2 mb-3">
                    <label className="relative h-8 w-8 shrink-0 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-400 hover:scale-105 transition-all overflow-hidden shadow-sm">
                      <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: selectedItem.color }} />
                      <input
                        type="color"
                        value={selectedItem.color}
                        onChange={(e) => { update({ color: e.target.value }); commitChange(); }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        aria-label="Choose color"
                      />
                    </label>
                    <Input
                      value={selectedItem.color}
                      onChange={(e) => { update({ color: e.target.value }); }}
                      onBlur={commitChange}
                      className="h-8 text-xs bg-white border border-slate-200 hover:border-slate-300 focus:border-[#b0664c] text-slate-800 rounded-lg flex-1 font-mono uppercase"
                      aria-label="Color hex"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Preset colors">
                    {QUICK_COLORS.map((c) => (
                      <button
                        key={c}
                        className={`aspect-square rounded-lg transition-all duration-100 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#b0664c]/50 hover:scale-110 active:scale-100 relative ${
                          selectedItem.color === c
                            ? "ring-2 ring-[#b0664c] ring-offset-1 ring-offset-white scale-110"
                            : "border border-slate-200 hover:border-slate-400"
                        }`}
                        style={{ backgroundColor: c }}
                        onClick={() => { update({ color: c }); commitChange(); }}
                        aria-label={`Color ${c}`}
                        aria-pressed={selectedItem.color === c}
                      >
                        {selectedItem.color === c && (
                          <Check className={`h-3 w-3 absolute inset-0 m-auto ${
                            ["#ffffff", "#f5f5f5", "#e8e0d4", "#d4c5b0", "#c4b5a0", "#d4a574", "#c4a882"].includes(c)
                              ? "text-black/50"
                              : "text-white/70"
                          }`} />
                        )}
                      </button>
                    ))}
                  </div>
                </Section> 


                <Section icon={Sun} label="Appearance" disabled={isLocked}>
                  <div className="space-y-4">
                    {[
                      { label: "Opacity", key: "opacity" as const, max: 1, step: 0.05, format: (v: number) => `${Math.round(v * 100)}%` },
                      { label: "Shadow", key: "shadowBlur" as const, max: 30, step: 1, format: (v: number) => `${v}px` },
                    ].map(({ label, key, max, step, format }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label htmlFor={`slider-${key}`} className="text-[10px] text-slate-500 font-medium">{label}</Label>
                          <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                            {format(selectedItem[key])}
                          </span>
                        </div>
                        <Slider
                          id={`slider-${key}`}
                          value={[selectedItem[key]]}
                          onValueChange={(v) => update({ [key]: Array.isArray(v) ? v[0] : v })}
                          onValueCommitted={commitChange}
                          max={max}
                          step={step}
                          aria-label={label}
                          aria-valuetext={format(selectedItem[key])}
                        />
                      </div>
                    ))}
                  </div>
                </Section>


                <Section icon={Layers} label="Layer" disabled={isLocked}>
                  <div className="grid grid-cols-2 gap-2">
                    <ActionBtn onClick={() => { bringForward(selectedItem.instanceId); commitChange(); }} className="flex-1" ariaLabel="Bring forward">
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      Forward
                    </ActionBtn>
                    <ActionBtn onClick={() => { sendBackward(selectedItem.instanceId); commitChange(); }} className="flex-1" ariaLabel="Send backward">
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      Back
                    </ActionBtn>
                  </div>
                </Section>


                <div className="grid grid-cols-2 gap-2 pt-1 pb-3">
                  <ActionBtn onClick={handleDuplicate} variant="primary" className="flex-1" ariaLabel="Duplicate item">
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    Duplicate
                  </ActionBtn>
                  <ActionBtn
                    onClick={() => { update({ rotation: (selectedItem.rotation + 90) % 360 }); commitChange(); }}
                    variant="default"
                    className="flex-1"
                    ariaLabel="Rotate 90°"
                    disabled={isLocked}
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Rotate 90°
                  </ActionBtn>
                </div>

              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

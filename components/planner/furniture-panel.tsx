"use client";

import {
  FURNITURE_CATALOG,
  FURNITURE_CATEGORIES,
  getCatalogFootprintPreset,
} from "@/lib/data/furniture";
import { useDesignStore, type FurnitureItem } from "@/lib/stores/design-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FurniturePreview3D } from "@/components/planner/furniture-preview-3d";
import { createId } from "@/lib/utils";
import {
  Armchair,
  Search,
  Plus,
  Ruler,
  Paintbrush,
  Settings2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const PRESET_COLORS = [
  "#ffffff", "#f5f5f5", "#e8e0d4", "#d4c5b0", "#c4b5a0",
  "#a0845c", "#8b7355", "#5c4033", "#2d2d2d", "#1a1a1a",
];

type PanelTab = "catalog" | "room";

interface FurniturePanelProps {
  collapsed: boolean;
  onToggle: () => void;
  onPlacementBlocked: () => void;
}

export function FurniturePanel({ collapsed, onToggle, onPlacementBlocked }: FurniturePanelProps) {
  const {
    room,
    setRoom,
    addItem,
    items,
    viewMode,
    cameraMode,
    orbitTarget3d,
    walkCameraPosition3d,
    setOrbitTarget3d,
    setWalkCameraPosition3d,
  } = useDesignStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [tab, setTab] = useState<PanelTab>("catalog");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const normalizeRange = (min: number, max: number) => min <= max ? { min, max } : { min: (min + max) / 2, max: (min + max) / 2 };
  const is3DViewAvailable = viewMode !== "2d";
  const active3DPosition = cameraMode === "walk" ? walkCameraPosition3d : orbitTarget3d;
  const roomHalfWidth = room.width / 200;
  const roomHalfDepth = room.height / 200;
  const wallHeightMeters = room.wallHeight / 100;
  const threeDPositionBounds = {
    x: normalizeRange(
      cameraMode === "walk" ? -roomHalfWidth + 0.2 : -roomHalfWidth + 0.1,
      cameraMode === "walk" ? roomHalfWidth - 0.2 : roomHalfWidth - 0.1,
    ),
    y: normalizeRange(
      cameraMode === "walk" ? 0.3 : 0.1,
      cameraMode === "walk" ? wallHeightMeters - 0.2 : wallHeightMeters - 0.1,
    ),
    z: normalizeRange(
      cameraMode === "walk" ? -roomHalfDepth + 0.2 : -roomHalfDepth + 0.1,
      cameraMode === "walk" ? roomHalfDepth - 0.2 : roomHalfDepth - 0.1,
    ),
  };

  const update3DPosition = (axis: "x" | "y" | "z", rawValue: number) => {
    const nextValue = clamp(rawValue, threeDPositionBounds[axis].min, threeDPositionBounds[axis].max);
    const nextPosition = { ...active3DPosition, [axis]: nextValue };

    if (cameraMode === "walk") {
      setWalkCameraPosition3d(nextPosition);
      return;
    }

    setOrbitTarget3d(nextPosition);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = FURNITURE_CATALOG.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory ? item.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (catalogItem: (typeof FURNITURE_CATALOG)[0]) => {
    const spawnX = room.width / 2 - catalogItem.width / 2;
    const spawnY = room.height / 2 - catalogItem.height / 2;
    const spawnX2 = spawnX + catalogItem.width;
    const spawnY2 = spawnY + catalogItem.height;
    const hasOverlap = items.some((item) => {
      const ix2 = item.x + item.width;
      const iy2 = item.y + item.height;
      return spawnX < ix2 && spawnX2 > item.x && spawnY < iy2 && spawnY2 > item.y;
    });
    if (hasOverlap) {
      onPlacementBlocked();
      return;
    }
    const newItem: FurnitureItem = {
      instanceId: createId("item"),
      catalogId: catalogItem.id,
      name: catalogItem.name,
      x: room.width / 2 - catalogItem.width / 2,
      y: room.height / 2 - catalogItem.height / 2,
      width: catalogItem.width,
      height: catalogItem.height,
      depth: catalogItem.depth,
      rotation: 0,
      color: catalogItem.defaultColor,
      opacity: 1,
      modelScale: (catalogItem.modelScale ?? 1) * 0.7,
      elevation: 0,
      shapeType: catalogItem.shapeType,
      footprintPreset: getCatalogFootprintPreset(catalogItem),
      locked: false,
      zIndex: 0,
      shadowBlur: 0,
      borderRadius: catalogItem.shapeType === "circle" ? 999 : 3,
    };
    addItem(newItem);
  };

  return (
    <>
    <div className="relative max-w-3xl mx-auto w-full font-sans">

      <button
        onClick={onToggle}
        className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 h-10 px-5 rounded-t-2xl bg-white border-2 border-b-0 border-slate-900 text-slate-700 hover:bg-[#f7e7e1] transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60"
        aria-label={collapsed ? "Show furniture panel (F)" : "Hide furniture panel (F)"}
        aria-expanded={!collapsed}
        title={collapsed ? "Show furniture panel (F)" : "Hide furniture panel (F)"}
      >
        {collapsed ? ( 
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" /> 
        )}
        <span className="text-[10px] font-bold tracking-wide">
          {collapsed ? "SHOW FURNITURE" : "HIDE FURNITURE"}
        </span>
        <span className="rounded-md border border-slate-300 bg-[#f7e7e1] px-1.5 py-0.5 text-[9px] font-black leading-none text-slate-600">
          F
        </span>
      </button>

      <div
      className="bg-white border-2 rounded-[32px] overflow-hidden border-slate-900 font-sans flex flex-col relative max-w-3xl mx-auto w-full shadow-lg"
      role="complementary"
      aria-label="Furniture catalog and room settings"
    >

      {!collapsed && (
        <div className="flex  flex-col" style={{ height: "260px" }}>

          <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-slate-900 shrink-0 bg-[#f7e7e1]">

              <div className="flex items-center bg-white rounded-xl p-1 border-2 border-slate-300 shrink-0 gap-1" role="tablist" aria-label="Panel tabs">
              <button
                role="tab"
                aria-selected={tab === "catalog"}
                  className={`h-8 px-4 rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60 flex items-center gap-2 ${tab === "catalog"
                  ? "bg-[#b0664c] text-white shadow-md border-2 border-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-[#f7e7e1] border-2 border-transparent"
                  }`}
                onClick={() => setTab("catalog")}
              >
                <Armchair className="h-4 w-4" />
                Catalog
              </button>
              <button
                role="tab"
                aria-selected={tab === "room"}
                  className={`h-8 px-4 rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60 flex items-center gap-2 ${tab === "room"
                  ? "bg-[#b0664c] text-white shadow-md border-2 border-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-[#f7e7e1] border-2 border-transparent"
                  }`}
                onClick={() => setTab("room")}
              >
                <Settings2 className="h-4 w-4" />
                Room
              </button>
            </div>
            

            {tab === "catalog" && (
              <div className="flex items-center gap-3 ml-auto">

                <div className="shrink-0 relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="h-9 text-sm bg-white border-2 border-slate-300 text-slate-700 rounded-xl px-4 pr-10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60 hover:bg-[#f7e7e1] hover:border-slate-400 transition-colors inline-flex items-center gap-2 relative font-semibold"
                    aria-label="Filter by category"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="listbox"
                    aria-controls="furniture-category-listbox"
                  >
                    {activeCategory ?? "Categories"}
                    <ChevronDown className={`h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {dropdownOpen && (
                    <div
                      id="furniture-category-listbox"
                      className="absolute top-full left-0 mt-2 w-52 overflow-hidden bg-white border-2 border-slate-900 rounded-2xl shadow-xl z-50"
                      role="listbox"
                      aria-label="Category list"
                    >
                      <div className="planner-dropdown-scroll max-h-44 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
                        <button
                          type="button"
                            className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 border-slate-200 ${activeCategory === null ? "bg-[#b0664c] text-white" : "text-slate-600 hover:bg-[#f7e7e1] hover:text-slate-900"
                            }`}
                          onClick={() => { setActiveCategory(null); setDropdownOpen(false); }}
                          role="option"
                          aria-selected={activeCategory === null}
                        >
                          All
                        </button>
                        {FURNITURE_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                              className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors border-b border-slate-200 last:border-b-0 ${activeCategory === cat ? "bg-[#b0664c] text-white" : "text-slate-600 hover:bg-[#f7e7e1] hover:text-slate-900"
                              }`}
                            onClick={() => { setActiveCategory(cat); setDropdownOpen(false); }}
                            role="option"
                            aria-selected={activeCategory === cat}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>


                <div className="relative shrink-0 w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                  <Input
                    placeholder="Search furniture..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-9 text-sm bg-white border-2 border-slate-300 text-slate-800 rounded-xl placeholder:text-slate-400 hover:border-slate-400 focus:border-[#b0664c] focus-visible:ring-2 focus-visible:ring-[#b0664c]/40"
                    aria-label="Search furniture catalog"
                  />
                </div>
              </div>
            )}
          </div>


          {tab === "catalog" ? (
            <div className="flex-1 relative bg-[#f7e7e1]">
              <div
                ref={scrollRef}
                className="h-full overflow-x-auto overflow-y-hidden px-4 py-3"
                id="panel-catalog"
                role="tabpanel"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(176,102,76,0.4) transparent" }}
              >
                <div className="flex gap-3 h-full">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      className="group relative flex flex-col items-center rounded-2xl overflow-hidden bg-white border-2 border-slate-200 hover:border-[#b0664c] hover:scale-105 active:scale-100 transition-all duration-150 shrink-0 w-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7e7e1]"
                      aria-label={`Add ${item.name} (${item.width}×${item.height}cm)`}
                    >
                        <div className="w-full h-25 relative flex items-center justify-center bg-[#f7e7e1]">
                          <div className="h-full w-full">
                            <FurniturePreview3D item={item} />
                          </div>
                      </div>
                      <div className="text-center w-full px-3 py-2.5 bg-white border-t-2 border-slate-200">
                        <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p> 
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-xl p-1.5 shadow-lg">
                        <Plus className="h-4 w-4 text-black" aria-hidden="true" />
                      </div>
                    </button>
                  ))}
                  {filteredItems.length === 0 && (
                    <p className="text-sm text-slate-400 flex items-center justify-center w-full font-semibold">No furniture found matching your search</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 relative bg-[#f7e7e1]">
              <div
                className="h-full overflow-x-auto overflow-y-auto px-3 py-2"
                id="panel-room"
                role="tabpanel"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(176,102,76,0.4) transparent" }}
              >
                <div className="flex min-h-full items-start gap-2.5 pb-1">
                  <section className="shrink-0 w-60 rounded-2xl bg-white border-2 border-slate-200 p-2.5 flex flex-col gap-2">
                    <Label htmlFor="room-name" className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Ruler className="h-3 w-3" />
                      Room
                    </Label>
                    <Input
                      id="room-name"
                      value={room.name}
                      onChange={(e) => setRoom({ name: e.target.value })}
                      className="h-7 text-[11px] bg-[#f7e7e1] border-slate-300 text-slate-800 rounded-lg placeholder:text-slate-300"
                      placeholder="e.g., Living Room"
                    />

                    <div className="space-y-2.5">
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-medium">Width</span>
                          <span className="text-[10px] text-slate-600 font-mono tabular-nums">{room.width} cm</span>
                        </div>
                        <Slider
                          value={[room.width]}
                          min={100}
                          max={1500}
                          step={5}
                          onValueChange={(value) => setRoom({ width: Array.isArray(value) ? value[0] : value })}
                          aria-label="Room width"
                        />
                      </div>

                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-medium">Depth</span>
                          <span className="text-[10px] text-slate-600 font-mono tabular-nums">{room.height} cm</span>
                        </div>
                        <Slider
                          value={[room.height]}
                          min={100}
                          max={1500}
                          step={5}
                          onValueChange={(value) => setRoom({ height: Array.isArray(value) ? value[0] : value })}
                          aria-label="Room depth"
                        />
                      </div>

                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-medium">Wall Height</span>
                          <span className="text-[10px] text-slate-600 font-mono tabular-nums">{room.wallHeight} cm</span>
                        </div>
                        <Slider
                          value={[room.wallHeight]}
                          min={200}
                          max={400}
                          step={2}
                          onValueChange={(value) => setRoom({ wallHeight: Array.isArray(value) ? value[0] : value })}
                          aria-label="Wall height"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="shrink-0 w-56 rounded-2xl bg-white border-2 border-slate-200 p-2.5 flex flex-col gap-1.5">
                    <Label className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Paintbrush className="h-3 w-3" />
                      Colours
                    </Label>
                    <div className="space-y-1">
                      {(
                        [
                          { label: "Wall", key: "wallColor" as const },
                          { label: "Floor", key: "floorColor" as const },
                          { label: "Ceiling", key: "ceilingColor" as const },
                        ] as const
                      ).map(({ label, key }) => (
                        <div key={key} className="rounded-xl border border-slate-200 bg-[#f7e7e1] px-2 py-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-500 font-medium shrink-0">{label}</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="color"
                                value={room[key]}
                                onChange={(e) => setRoom({ [key]: e.target.value })}
                                className="h-5 w-5 rounded-md border border-slate-200 cursor-pointer bg-transparent shrink-0"
                                aria-label={`${label} colour`}
                              />
                              <div className="flex gap-0.5">
                                {PRESET_COLORS.slice(0, 4).map((c) => (
                                  <button
                                    key={c}
                                    className={`h-4.5 w-4.5 rounded-md border transition-all cursor-pointer ${room[key] === c ? "border-[#b0664c] scale-110" : "border-slate-200 hover:border-slate-400"}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setRoom({ [key]: c })}
                                    aria-label={`Set ${label.toLowerCase()} to ${c}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="shrink-0 w-52 rounded-2xl bg-white border-2 border-slate-200 p-2.5 flex flex-col gap-2">
                    <Label className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="h-3 w-3" />
                      Grid & Lighting
                    </Label>

                    <div className="rounded-xl border border-slate-200 bg-[#f7e7e1] px-2 py-1.5 space-y-1.5">
                      <label className="flex items-center justify-between gap-2 cursor-pointer">
                        <span className="text-[10px] text-slate-500 font-medium">Show Grid</span>
                        <button
                          role="switch"
                          aria-checked={room.showGrid}
                          className={`h-5 w-9 rounded-full transition-colors ${room.showGrid ? "bg-[#b0664c]" : "bg-slate-200"}`}
                          onClick={() => setRoom({ showGrid: !room.showGrid })}
                          aria-label="Toggle grid visibility"
                        >
                          <div className={`h-4 w-4 rounded-full transition-transform bg-white mx-0.5 ${room.showGrid ? "translate-x-3.5" : ""}`} />
                        </button>
                      </label>

                      

                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-medium">Grid Size</span>
                          <span className="text-[10px] text-slate-600 font-mono tabular-nums">{room.gridSize}px</span>
                        </div>
                        <Slider
                          value={[room.gridSize]}
                          onValueChange={(v) => setRoom({ gridSize: Array.isArray(v) ? v[0] : v })}
                          min={10}
                          max={50}
                          step={5}
                          aria-label="Grid size"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-[#f7e7e1] px-2 py-1.5">
                      <label className="flex items-center justify-between gap-2 cursor-pointer">
                        <span className="text-[10px] text-slate-500 font-medium">Room Lights</span>
                        <button
                          role="switch"
                          aria-checked={room.lightsOn}
                          className={`h-5 w-9 rounded-full transition-colors ${room.lightsOn ? "bg-[#b0664c]" : "bg-slate-200"}`}
                          onClick={() => setRoom({ lightsOn: !room.lightsOn })}
                          aria-label="Toggle room lights"
                        >
                          <div className={`h-4 w-4 rounded-full transition-transform mx-0.5 ${room.lightsOn ? "translate-x-3.5 bg-white" : "bg-white/70"}`} />
                        </button>
                      </label>
                    </div>
                  </section>

                  <section className="shrink-0 w-60 rounded-2xl bg-white border-2 border-slate-200 p-2.5 flex flex-col gap-2">
                    <Label className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Settings2 className="h-3 w-3" />
                      {cameraMode === "walk" ? "3D Camera" : "3D Position"}
                    </Label>
                    <div className={`rounded-xl border border-slate-200 bg-[#f7e7e1] p-2.5 ${is3DViewAvailable ? "" : "opacity-50"}`}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          {cameraMode === "walk" ? "Walk Mode" : "Orbit Focus"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {is3DViewAvailable ? "Live" : "3D only"}
                        </span>
                      </div>
                      {!is3DViewAvailable && (
                        <p className="mb-2.5 text-[10px] leading-snug text-slate-400">
                          Open 3D or Split view to move the room position with sliders.
                        </p>
                      )}
                      <div className="space-y-2.5">
                        {([
                          { label: "X", axis: "x" as const },
                          { label: "Y", axis: "y" as const },
                          { label: "Z", axis: "z" as const },
                        ] as const).map(({ label, axis }) => (
                          <div key={axis}>
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-500 font-medium">{label}</span>
                              <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                                {active3DPosition[axis].toFixed(2)}m
                              </span>
                            </div>
                            <Slider
                              value={[active3DPosition[axis]]}
                              onValueChange={(value) => update3DPosition(axis, Array.isArray(value) ? value[0] : value)}
                              min={threeDPositionBounds[axis].min}
                              max={threeDPositionBounds[axis].max}
                              step={0.05}
                              disabled={!is3DViewAvailable}
                              aria-label={`3D ${label} position`}
                              aria-valuetext={`${active3DPosition[axis].toFixed(2)} meters`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
    </>
  );
}

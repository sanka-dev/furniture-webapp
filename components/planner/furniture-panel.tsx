"use client";


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}

export function FurniturePanel({ collapsed, onToggle }: FurniturePanelProps) {
  const { room, setRoom, addItem, undo, redo } = useDesignStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [tab, setTab] = useState<PanelTab>("catalog");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roomWidthInput, setRoomWidthInput] = useState(String(room.width));
  const [roomDepthInput, setRoomDepthInput] = useState(String(room.height));
  const [wallHeightInput, setWallHeightInput] = useState(String(room.wallHeight));
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  useEffect(() => {
    setRoomWidthInput(String(room.width));
  }, [room.width]);

  useEffect(() => {
    setRoomDepthInput(String(room.height));
  }, [room.height]);

  useEffect(() => {
    setWallHeightInput(String(room.wallHeight));
  }, [room.wallHeight]);

  const commitRoomWidth = () => {
    const parsed = Number(roomWidthInput);
    if (!Number.isFinite(parsed)) {
      setRoomWidthInput(String(room.width));
      return;
    }
    const next = clamp(parsed, 100, 1500);
    setRoom({ width: next });
    setRoomWidthInput(String(next));
  };

  const commitRoomDepth = () => {
    const parsed = Number(roomDepthInput);
    if (!Number.isFinite(parsed)) {
      setRoomDepthInput(String(room.height));
      return;
    }
    const next = clamp(parsed, 100, 1500);
    setRoom({ height: next });
    setRoomDepthInput(String(next));
  };

  const commitWallHeight = () => {
    const parsed = Number(wallHeightInput);
    if (!Number.isFinite(parsed)) {
      setWallHeightInput(String(room.wallHeight));
      return;
    }
    const next = clamp(parsed, 200, 400);
    setRoom({ wallHeight: next });
    setWallHeightInput(String(next));
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
      modelScale: catalogItem.modelScale ?? 1,
      shapeType: catalogItem.shapeType,
      locked: false,
      zIndex: 0,
      shadowBlur: 0,
      borderRadius: catalogItem.shapeType === "circle" ? 999 : 3,
    };
    addItem(newItem);
  };

  return (
    <div className="relative max-w-3xl mx-auto w-full font-sans">

      <button
        onClick={onToggle}
        className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 h-10 px-5 rounded-t-2xl bg-white border-2 border-b-0 border-slate-900 text-slate-700 hover:bg-[#f7e7e1] transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b0664c]/60"
        aria-label={collapsed ? "Show furniture panel" : "Hide furniture panel"}
        aria-expanded={!collapsed}
      >
        {collapsed ? ( 
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" /> 
        )}
        <span className="text-[10px] font-bold tracking-wide">
          {collapsed ? "SHOW FURNITURE" : "HIDE FURNITURE"}
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
            

        
          </div>

        </div>
      )}
    </div>
    </div>
  );
}

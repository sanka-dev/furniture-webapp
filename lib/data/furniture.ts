import { resolveFootprintPreset, type FootprintPreset } from "@/lib/planner/footprints";

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  depth: number;
  defaultColor: string;
  shapeType: "rect" | "circle" | "ellipse" | "l-shape";
  footprintPreset?: FootprintPreset;
  icon: string;
  modelUrl?: string;
  modelScale?: number;
}

export const FURNITURE_CATEGORIES = [
  "Chairs",
  "Desk", 
  "Sofas",
  "Shelving",
  "Beds",
  "Full Sets",
  "Lighting",
  "Decor",
] as const;

export const FURNITURE_CATALOG: CatalogItem[] = [

{
  id: "Chair 1",
  name: "Chair 1",
  category: "Chairs",
  width: 220,
  height: 85,
  depth: 80,
  defaultColor: "#ffffff",
  shapeType: "rect",
  footprintPreset: "chair",
  icon: "chair",
  modelUrl: "/models/chair1.glb",
  modelScale: 1.0,
},{ 
  id: "Chair 2",
  name: "Chair 2",
  category: "Chairs",
  width: 220,
  height: 85,
  depth: 80,
  defaultColor: "#ffffff",
  shapeType: "rect",
  footprintPreset: "chair",
  icon: "chair",
  modelUrl: "/models/vancy_chair.glb",
  modelScale: 1.0,
},

{
  id: "fullset",
  name: "Full Set 1",
  category: "Full Sets", 
  width: 220,
  height: 85,
  depth: 80,
  defaultColor: "#ffffff",
  shapeType: "rect",
  footprintPreset: "sectional",
  icon: "table", 
  modelUrl: "/models/fullset.glb",
  modelScale: 1.0,
},

{
  id: "bed1",
  name: "Bed 1",
  category: "Beds",
  width: 220,
  height: 85,
  depth: 80,
  defaultColor: "#ffffff",
  shapeType: "rect",
  footprintPreset: "bed",
  icon: "table", 
  modelUrl: "/models/bed.glb",
  modelScale: 1.0,
},

{
  id: "bed2",
  name: "Bed 2",
  category: "Beds",
  width: 220,
  height: 85,
  depth: 80,
  defaultColor: "#ffffff",
  shapeType: "rect",
  footprintPreset: "bed",
  icon: "table", 
  modelUrl: "/models/bed2.glb",
  modelScale: 1.0,
},

{
  id: "Shelves 1",
  name: "Shelves 1",
  category: "Shelving",
  width: 220,
  height: 85,
  depth: 80,
  defaultColor: "#ffffff",
  shapeType: "rect",
  footprintPreset: "shelving",
  icon: "table", 
  modelUrl: "/models/book.glb",
  modelScale: 1.0,
},


{
  id: "Shelves 2",
  name: "Shelves 2",
  category: "Shelving",
  width: 220,
  height: 85,
  depth: 80,
  defaultColor: "#ffffff",
  shapeType: "rect",
  footprintPreset: "shelving",
  icon: "table", 
  modelUrl: "/models/book2.glb",
  modelScale: 1.0,
},


{
  id: "Bed 2",
  name: "Bed 2",
  category: "Beds",
  width: 220,
  height: 85,
  depth: 80,
  defaultColor: "#ffffff",
  shapeType: "rect",
  footprintPreset: "bed",
  icon: "table", 
  modelUrl: "/models/bed22.glb",
  modelScale: 1.0,
},

{
  id: "Chair 3",
  name: "Chair 3",
  category: "Chairs", 
  width: 220,
  height: 85,
  depth: 80,
  defaultColor: "#ffffff",
  shapeType: "rect",
  footprintPreset: "chair",
  icon: "table", 
  modelUrl: "/models/chair.glb",
  modelScale: 1.0,
},

{
  id: "Desk 1",
  name: "Desk 1",
  category: "Desk",
  width: 220,
  height: 85,
  depth: 80,
  defaultColor: "#ffffff",
  shapeType: "rect",
  footprintPreset: "desk",
  icon: "table", 
  modelUrl: "/models/desk.glb",
  modelScale: 1.0,
},


];

export function getCatalogFootprintPreset(item: CatalogItem): FootprintPreset {
  return (
    item.footprintPreset ??
    resolveFootprintPreset({
      catalogId: item.id,
      name: item.name,
      category: item.category,
      icon: item.icon,
      shapeType: item.shapeType,
    })
  );
}

export function getCatalogItem(id: string): CatalogItem | undefined {
  return FURNITURE_CATALOG.find((item) => item.id === id);
}

export function getCategoryItems(category: string): CatalogItem[] {
  return FURNITURE_CATALOG.filter((item) => item.category === category);
}

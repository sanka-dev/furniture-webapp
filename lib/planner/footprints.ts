export type FurnitureShapeType = "rect" | "circle" | "ellipse" | "l-shape";

export type FootprintPreset =
  | "chair"
  | "bed"
  | "shelving"
  | "desk"
  | "sectional"
  | "rect"
  | "circle"
  | "ellipse";

export interface FootprintResolverInput {
  catalogId?: string;
  category?: string;
  icon?: string;
  name?: string;
  shapeType?: FurnitureShapeType;
}

const normalize = (value?: string) => (value ?? "").trim().toLowerCase();

export function resolveFootprintPreset(input: FootprintResolverInput): FootprintPreset {
  const id = normalize(input.catalogId);
  const name = normalize(input.name);
  const category = normalize(input.category);
  const icon = normalize(input.icon);

  if (id.includes("chair") || name.includes("chair") || icon === "chair" || category === "chairs") {
    return "chair";
  }

  if (id.includes("bed") || name.includes("bed") || category === "beds") {
    return "bed";
  }

  if (
    id.includes("shel") ||
    id.includes("book") ||
    name.includes("shelf") ||
    name.includes("book") ||
    category === "shelving"
  ) {
    return "shelving";
  }

  if (id.includes("desk") || name.includes("desk") || category === "desk") {
    return "desk";
  }

  if (
    id.includes("fullset") ||
    name.includes("full set") ||
    name.includes("sectional") ||
    category === "full sets" ||
    input.shapeType === "l-shape"
  ) {
    return "sectional";
  }

  if (input.shapeType === "circle") return "circle";
  if (input.shapeType === "ellipse") return "ellipse";

  return "rect";
}

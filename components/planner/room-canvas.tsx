"use client";

import { useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Circle, Group, Line, Transformer, Text } from "react-konva";
import { useDesignStore } from "@/lib/stores/design-store";
import { createId } from "@/lib/utils";
import { FURNITURE_CATALOG, getCatalogFootprintPreset } from "@/lib/data/furniture";
import { resolveFootprintPreset, type FootprintPreset } from "@/lib/planner/footprints";
import type Konva from "konva";
import {
  Move,
  RotateCw,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface RoomCanvasProps {
  zoom: number;
}

function LineGrid({ width, height, gridSize }: { width: number; height: number; gridSize: number }) {
  const lines: React.ReactNode[] = [];
  

  for (let x = 0; x <= width; x += gridSize) {
    const isMajor = x % (gridSize * 4) === 0;
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke={isMajor ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"}
        strokeWidth={isMajor ? 1 : 0.5}
        listening={false}
      />
    );
  }
  
  for (let y = 0; y <= height; y += gridSize) {
    const isMajor = y % (gridSize * 4) === 0;
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke={isMajor ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"}
        strokeWidth={isMajor ? 1 : 0.5}
        listening={false}
      />
    );
  }
  
  return <>{lines}</>;
}

function CrosshairGuides({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  return (
    <>
      <Line points={[x, 0, x, height]} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} dash={[4, 4]} listening={false} />
      <Line points={[0, y, width, y]} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} dash={[4, 4]} listening={false} />
    </>
  );
}

function parseRgbColor(color: string): { r: number; g: number; b: number } | null {
  const value = color.trim();

  const shortHex = /^#([0-9a-fA-F]{3})$/.exec(value);
  if (shortHex) {
    const [r, g, b] = shortHex[1].split("").map((part) => parseInt(`${part}${part}`, 16));
    return { r, g, b };
  }

  const longHex = /^#([0-9a-fA-F]{6})$/.exec(value);
  if (longHex) {
    const raw = longHex[1];
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16),
    };
  }

  const rgb = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i.exec(value);
  if (rgb) {
    return {
      r: Math.min(255, parseInt(rgb[1], 10)),
      g: Math.min(255, parseInt(rgb[2], 10)),
      b: Math.min(255, parseInt(rgb[3], 10)),
    };
  }

  return null;
}

function isLightFillColor(color: string): boolean {
  const rgb = parseRgbColor(color);
  if (!rgb) return false;

  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance > 0.63;
}

type SimpleFootprintShape = "circle" | "square";

function getSimpleShapeForFootprint(preset: FootprintPreset): SimpleFootprintShape {
  switch (preset) {
    case "chair":
    case "circle":
    case "ellipse":
      return "circle";
    default:
      return "square";
  }
}

function FurnitureShape({
  item,
  isSelected,
  onSelect,
  onChange,
  snapToGrid,
  gridSize,
  roomWidth,
  roomHeight,
}: {
  item: ReturnType<typeof useDesignStore.getState>["items"][0];
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<typeof item>) => void;
  snapToGrid: boolean;
  gridSize: number;
  roomWidth: number;
  roomHeight: number;
}) {
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, item.shapeType, item.footprintPreset]);

  const snap = (val: number) => (snapToGrid ? Math.round(val / gridSize) * gridSize : Math.round(val));

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    const x = Math.max(0, Math.min(snap(e.target.x()), roomWidth - item.width));
    const y = Math.max(0, Math.min(snap(e.target.y()), roomHeight - item.height));
    onChange({ x, y });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: snap(node.x()),
      y: snap(node.y()),
      width: Math.max(10, Math.round(item.width * scaleX)),
      height: Math.max(10, Math.round(item.height * scaleY)),
      rotation: Math.round(node.rotation()),
    });
  };

  const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = item.locked ? "not-allowed" : "grab";
  };

  const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = "default";
  };

  const selStroke = "rgba(255,255,255,0.8)";
  const dragStroke = "rgba(100,200,255,0.6)";
  const defStroke = "rgba(255,255,255,0.08)";
  const stroke = isDragging ? dragStroke : isSelected ? selStroke : defStroke;
  const sw = isDragging ? 2 : isSelected ? 1.5 : 0.5;
  const lightFill = isLightFillColor(item.color);
  const labelFill = isDragging
    ? lightFill
      ? "rgba(20,24,34,0.94)"
      : "rgba(255,255,255,0.9)"
    : lightFill
      ? "rgba(20,24,34,0.86)"
      : "rgba(255,255,255,0.8)";
  const labelStroke = lightFill ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.55)";
  const labelShadow = lightFill ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.5)";

  const renderShape = () => {
    const minSide = Math.min(item.width, item.height);
    const shapeSize = Math.max(12, minSide * 0.86);
    const squareX = (item.width - shapeSize) / 2;
    const squareY = (item.height - shapeSize) / 2;
    const squareCornerRadius = Math.min(item.borderRadius, shapeSize / 3);
    const common = {
      fill: item.color,
      opacity: item.opacity,
      stroke,
      strokeWidth: sw,
      shadowBlur: item.shadowBlur,
      shadowColor: "rgba(0,0,0,0.5)",
      shadowOffsetY: item.shadowBlur > 0 ? 2 : 0,
    };

    const catalogItem = FURNITURE_CATALOG.find((entry) => entry.id === item.catalogId);
    const footprintPreset =
      item.footprintPreset ??
      (catalogItem
        ? getCatalogFootprintPreset(catalogItem)
        : resolveFootprintPreset({
            catalogId: item.catalogId,
            name: item.name,
            shapeType: item.shapeType,
          }));

    const simpleShape = getSimpleShapeForFootprint(footprintPreset);

    if (simpleShape === "circle") {
      return (
        <Circle
          x={item.width / 2}
          y={item.height / 2}
          radius={shapeSize / 2}
          {...common}
        />
      );
    }

    return (
      <Rect
        x={squareX}
        y={squareY}
        width={shapeSize}
        height={shapeSize}
        {...common}
        cornerRadius={squareCornerRadius}
      />
    );
  };

  return (
    <>
      <Group
        ref={shapeRef}
        x={item.x}
        y={item.y}
        rotation={item.rotation}
        draggable={!item.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

        {isDragging && (
          <Rect
            width={item.width + 8}
            height={item.height + 8}
            x={-4}
            y={-4}
            fill="rgba(100,200,255,0.04)"
            cornerRadius={6}
            listening={false}
          />
        )}
        {renderShape()}
        <Text
          text={item.name}
          fontSize={Math.max(12, Math.min(16, item.width / 4.6))}
          fill={labelFill}
          width={item.width}
          height={item.height}
          align="center"
          verticalAlign="middle"
          listening={false}
          fontFamily='"Fredoka", "Inclusive Sans", system-ui, sans-serif'
          stroke={labelStroke}
          strokeWidth={0.45}
          shadowColor={labelShadow}
          shadowBlur={2}
          shadowOffsetY={1}
        />
        {item.locked && (
          <Text text="🔒" fontSize={10} x={2} y={2} listening={false} />
        )}
      </Group>
      {isSelected && !item.locked && (
        <Transformer
          ref={trRef}
          rotateEnabled
          borderStroke="rgba(255,255,255,0.5)"
          borderStrokeWidth={1}
          borderDash={[3, 3]}
          anchorStroke="rgba(255,255,255,0.7)"
          anchorFill="#1a1a1a"
          anchorSize={8}
          anchorCornerRadius={4}
          rotateAnchorOffset={20}
          enabledAnchors={[
            "top-left", "top-right", "bottom-left", "bottom-right",
            "middle-left", "middle-right", "top-center", "bottom-center",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

function FloatingActions({
  item,
  zoom,
  padX,
  padY,
}: {
  item: ReturnType<typeof useDesignStore.getState>["items"][0];
  zoom: number;
  padX: number;
  padY: number;
}) {
  const { updateItem, removeItem, addItem, pushHistory, selectItem } = useDesignStore();

  const nudge = (dx: number, dy: number) => {
    updateItem(item.instanceId, { x: item.x + dx, y: item.y + dy });
    pushHistory();
  };

  const rotate90 = () => {
    updateItem(item.instanceId, { rotation: (item.rotation + 90) % 360 });
    pushHistory();
  };

  const duplicate = () => {
    const newId = createId("item");
    addItem({ ...item, instanceId: newId, x: item.x + 20, y: item.y + 20 });
    selectItem(newId);
  };

  const del = () => removeItem(item.instanceId);

  const left = (item.x + padX) * zoom;
  const top = (item.y + padY + item.height) * zoom + 8;

  const btnCls = "h-6 w-6 rounded-md bg-white border border-slate-200 hover:bg-[#f7e7e1] hover:border-[#b0664c] text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all";

  return null;
}

export function RoomCanvas({ zoom }: RoomCanvasProps) {
  const { room, items, selectedItemId, selectItem, updateItem, pushHistory, panOffset, setPanOffset } = useDesignStore();
  const stageRef = useRef<Konva.Stage>(null);
  const [dragTarget, setDragTarget] = useState<{ x: number; y: number } | null>(null);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage()) selectItem(null);
  };

  const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);
  const W = room.width;
  const H = room.height;
  const pad = 50;

  const selectedItem = items.find((i) => i.instanceId === selectedItemId);

  return (
    <div
      className="flex-1 overflow-auto bg-[#f0e8e2] flex items-center justify-center relative"
      role="region"
      aria-label={`2D room canvas, ${W}cm by ${H}cm, ${items.length} items placed`}
    >

      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-slate-200 rounded-lg px-3 py-2 text-[10px] text-slate-500 font-mono">
        <div className="flex gap-3">
          <span><kbd className="px-1.5 py-0.5 bg-[#f7e7e1] border border-slate-200 rounded text-slate-600">W A S D</kbd> Pan</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#f7e7e1] border border-slate-200 rounded text-slate-600">↑ ↓ ← →</kbd> Move</span>
          <span><kbd className="px-1.5 py-0.5 bg-[#f7e7e1] border border-slate-200 rounded text-slate-600">G</kbd> Grid</span> 
          <span><kbd className="px-1.5 py-0.5 bg-[#f7e7e1] border border-slate-200 rounded text-slate-600">Shift</kbd> Faster</span>
        </div>
      </div>

      <div
        className="relative"
        style={{
          transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: "center center",
          transition: "transform 0.15s ease-out",
        }}
      >
        <Stage
          ref={stageRef}
          width={W + pad * 2}
          height={H + pad * 2}
          onClick={handleStageClick}
          onTap={handleStageClick}
          offsetX={-pad}
          offsetY={-pad}
        > 
          <Layer>

            <Rect x={-pad} y={-pad} width={W + pad * 2} height={H + pad * 2} fill="#060606" listening={false} />

            <Rect width={W} height={H} fill={room.floorColor} cornerRadius={3} />


            {room.showGrid && <LineGrid width={W} height={H} gridSize={room.gridSize} />}

            <Rect width={W} height={H} stroke={room.wallColor} strokeWidth={3} listening={false} cornerRadius={3} />
            <Line points={[0, H + 14, W, H + 14]} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} listening={false} />
            <Line points={[0, H + 10, 0, H + 18]} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} listening={false} />
            <Line points={[W, H + 10, W, H + 18]} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} listening={false} />
            <Text x={W / 2 - 20} y={H + 22} text={`${W} cm`} fontSize={9} fill="rgba(255,255,255,0.2)" fontFamily="monospace" listening={false} />


            <Line points={[W + 14, 0, W + 14, H]} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} listening={false} />
            <Line points={[W + 10, 0, W + 18, 0]} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} listening={false} />
            <Line points={[W + 10, H, W + 18, H]} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} listening={false} />
            <Text x={W + 22} y={H / 2 - 4} text={`${H} cm`} fontSize={9} fill="rgba(255,255,255,0.2)" fontFamily="monospace" rotation={90} listening={false} />

            {dragTarget && <CrosshairGuides x={dragTarget.x} y={dragTarget.y} width={W} height={H} />}

            {sortedItems.map((item) => (
              <FurnitureShape
                key={item.instanceId}
                item={item}
                isSelected={selectedItemId === item.instanceId}
                onSelect={() => selectItem(item.instanceId)}
                snapToGrid={room.snapToGrid}
                gridSize={room.gridSize}
                roomWidth={W}
                roomHeight={H}
                onChange={(updates) => {
                  updateItem(item.instanceId, updates);
                  pushHistory();
                }}
              />
            ))}
          </Layer>
        </Stage>

        {selectedItem && !selectedItem.locked && (
          <FloatingActions item={selectedItem} zoom={1} padX={pad} padY={pad} />
        )}
      </div>
    </div>
  );
}

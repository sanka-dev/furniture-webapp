"use client";

import { create } from "zustand";
import { createId } from "@/lib/utils";
import type { FootprintPreset } from "@/lib/planner/footprints";

export interface FurnitureItem {
  instanceId: string;
  catalogId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  color: string;
  opacity: number;
  modelScale?: number;
  elevation?: number;
  shapeType: "rect" | "circle" | "ellipse" | "l-shape";
  footprintPreset?: FootprintPreset;
  locked: boolean;
  zIndex: number;
  shadowBlur: number;
  borderRadius: number;
}

export interface RoomConfig {
  width: number;
  height: number;
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  wallHeight: number;
  name: string;
  roomShape: "rectangular" | "l-shape" | "open-plan";
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  lightsOn: boolean;
  renderProfile: "default" | "cozy";
  postFxEnabled: boolean;
}

export interface Design {
  id: string;
  room: RoomConfig;
  items: FurnitureItem[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface DesignState {
  room: RoomConfig;
  items: FurnitureItem[];
  selectedItemId: string | null;
  history: { items: FurnitureItem[]; room: RoomConfig }[];
  historyIndex: number;
  viewMode: "2d" | "3d" | "split";
  transformMode: "translate" | "rotate" | "scale";
  panOffset: { x: number; y: number };
  cameraMode: "orbit" | "walk";
  orbitTarget3d: { x: number; y: number; z: number };
  walkCameraPosition3d: { x: number; y: number; z: number };

  setRoom: (room: Partial<RoomConfig>) => void;
  addItem: (item: FurnitureItem) => void;
  updateItem: (instanceId: string, updates: Partial<FurnitureItem>) => void;
  removeItem: (instanceId: string) => void;
  selectItem: (instanceId: string | null) => void;
  setViewMode: (mode: "2d" | "3d" | "split") => void;
  setTransformMode: (mode: "translate" | "rotate" | "scale") => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  setCameraMode: (mode: "orbit" | "walk") => void;
  setOrbitTarget3d: (target: { x: number; y: number; z: number }) => void;
  setWalkCameraPosition3d: (position: { x: number; y: number; z: number }) => void;
  bringForward: (instanceId: string) => void;
  sendBackward: (instanceId: string) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  clearDesign: () => void;
  loadDesign: (design: Design) => void;
  getDesignSnapshot: (userId: string) => Design;
}

const defaultRoom: RoomConfig = {
  width: 500,
  height: 400,
  wallColor: "#e8e8e8",
  floorColor: "#d4c5b0",
  ceilingColor: "#ffffff",
  wallHeight: 280,
  name: "Untitled Room",
  roomShape: "rectangular",
  showGrid: false,
  snapToGrid: true,
  gridSize: 25,
  lightsOn: true,
  renderProfile: "default",
  postFxEnabled: false,
};

const defaultOrbitTarget3d = { x: 0, y: 0.5, z: 0 };

function createDefaultWalkCameraPosition3d(room: RoomConfig = defaultRoom) {
  return { x: 0, y: 1.6, z: room.height / 200 };
}

export const useDesignStore = create<DesignState>()((set, get) => ({
  room: { ...defaultRoom },
  items: [],
  selectedItemId: null,
  history: [{ items: [], room: { ...defaultRoom } }],
  historyIndex: 0,
  viewMode: "3d",
  transformMode: "translate",
  panOffset: { x: 0, y: 0 },
  cameraMode: "orbit",
  orbitTarget3d: { ...defaultOrbitTarget3d },
  walkCameraPosition3d: createDefaultWalkCameraPosition3d(),

  setRoom: (updates) => {
    set((state) => ({ room: { ...state.room, ...updates } }));
    get().pushHistory();
  },

  setPanOffset: (offset) => set({ panOffset: offset }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setOrbitTarget3d: (target) => set({ orbitTarget3d: target }),
  setWalkCameraPosition3d: (position) => set({ walkCameraPosition3d: position }),

  addItem: (item) => {
    set((state) => ({ items: [...state.items, item] }));
    get().pushHistory();
  },

  updateItem: (instanceId, updates) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.instanceId === instanceId ? { ...i, ...updates } : i
      ),
    }));
  },

  removeItem: (instanceId) => {
    set((state) => ({
      items: state.items.filter((i) => i.instanceId !== instanceId),
      selectedItemId:
        state.selectedItemId === instanceId ? null : state.selectedItemId,
    }));
    get().pushHistory();
  },

  selectItem: (instanceId) => set({ selectedItemId: instanceId }),

  setViewMode: (mode) => set({ viewMode: mode }),
  setTransformMode: (mode) => set({ transformMode: mode }),

  bringForward: (instanceId) => {
    set((state) => {
      const maxZ = Math.max(...state.items.map((i) => i.zIndex), 0);
      return {
        items: state.items.map((i) =>
          i.instanceId === instanceId ? { ...i, zIndex: maxZ + 1 } : i
        ),
      };
    });
  },

  sendBackward: (instanceId) => {
    set((state) => {
      const minZ = Math.min(...state.items.map((i) => i.zIndex), 0);
      return {
        items: state.items.map((i) =>
          i.instanceId === instanceId ? { ...i, zIndex: minZ - 1 } : i
        ),
      };
    });
  },

  pushHistory: () => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({
        items: JSON.parse(JSON.stringify(state.items)),
        room: { ...state.room },
      });
      if (newHistory.length > 50) newHistory.shift();
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      const snapshot = state.history[newIndex];
      return {
        historyIndex: newIndex,
        items: JSON.parse(JSON.stringify(snapshot.items)),
        room: { ...snapshot.room },
        selectedItemId: null,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      const snapshot = state.history[newIndex];
      return {
        historyIndex: newIndex,
        items: JSON.parse(JSON.stringify(snapshot.items)),
        room: { ...snapshot.room },
        selectedItemId: null,
      };
    });
  },

  clearDesign: () => {
    set({
      room: { ...defaultRoom },
      items: [],
      selectedItemId: null,
      history: [{ items: [], room: { ...defaultRoom } }],
      historyIndex: 0,
      viewMode: "3d",
      orbitTarget3d: { ...defaultOrbitTarget3d },
      walkCameraPosition3d: createDefaultWalkCameraPosition3d(),
    });
  },

  loadDesign: (design) => {
    const nextRoom = { ...defaultRoom, ...design.room };
    set({
      room: nextRoom,
      items: JSON.parse(JSON.stringify(design.items)),
      selectedItemId: null,
      history: [
        {
          items: JSON.parse(JSON.stringify(design.items)),
          room: nextRoom,
        },
      ],
      historyIndex: 0,
      viewMode: "3d",
      orbitTarget3d: { ...defaultOrbitTarget3d },
      walkCameraPosition3d: createDefaultWalkCameraPosition3d(nextRoom),
    });
  },

  getDesignSnapshot: (userId) => {
    const state = get();
    return {
      id: createId("design"),
      room: { ...state.room },
      items: JSON.parse(JSON.stringify(state.items)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };
  },
}));

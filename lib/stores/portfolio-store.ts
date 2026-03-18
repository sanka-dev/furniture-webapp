"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import type { Design } from "./design-store";

interface PortfolioState {
  designs: Design[];
  loading: boolean;
  fetchDesigns: (userId: string) => Promise<void>;
  fetchDesignById: (userId: string, designId: string) => Promise<Design | undefined>;
  saveDesign: (design: Design) => Promise<{ success: boolean; error?: string }>;
  updateDesign: (id: string, design: Design) => Promise<{ success: boolean; error?: string }>;
  deleteDesign: (id: string) => Promise<{ success: boolean; error?: string }>;
  getDesign: (id: string) => Design | undefined;
  getDesignsByUser: (userId: string) => Design[];
}

export const usePortfolioStore = create<PortfolioState>()((set, get) => ({
  designs: [],
  loading: false,

  fetchDesigns: async (userId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .eq("designer_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const mappedDesigns: Design[] = (data || []).map((d) => ({
        id: d.id,
        userId: d.designer_id,
        room: d.room_config,
        items: d.items || [],
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));

      set({ designs: mappedDesigns, loading: false });
    } catch (error) {
      console.error("Error fetching designs:", error);
      set({ loading: false });
    }
  },

  fetchDesignById: async (userId, designId) => {
    const existing = get().designs.find((d) => d.id === designId);
    if (existing) return existing;

    try {
      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .eq("designer_id", userId)
        .eq("id", designId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return undefined;

      const mappedDesign: Design = {
        id: data.id,
        userId: data.designer_id,
        room: data.room_config,
        items: data.items || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      set((state) => ({
        designs: [mappedDesign, ...state.designs.filter((d) => d.id !== mappedDesign.id)],
      }));

      return mappedDesign;
    } catch (error) {
      console.error("Error fetching design by id:", error);
      return undefined;
    }
  },

  saveDesign: async (design) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("Error saving design: No active session");
        return { success: false, error: "Not authenticated. Please log in again." };
      }

      const userId = session.user.id;
      const { data: existingDesigner } = await supabase
        .from("designers")
        .select("id")
        .eq("id", userId)
        .single();

      if (!existingDesigner) {
        const { error: profileError } = await supabase.from("designers").upsert({
          id: userId,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Designer",
          email: session.user.email || "",
        }, { onConflict: "id" });

        if (profileError) {
          console.error("Error creating designer profile:", profileError.message);
          return { success: false, error: "Failed to create designer profile." };
        }
      }

      const { error } = await supabase.from("designs").insert({
        id: design.id,
        designer_id: userId,
        title: design.room.name,
        room_config: design.room,
        items: design.items,
        is_public: false,
      });

      if (error) throw error;

      set((state) => ({
        designs: [...state.designs, design],
      }));

      return { success: true };
    } catch (error: any) {
      console.error("Error saving design:", error?.message || error?.code || JSON.stringify(error));
      return { success: false, error: error?.message || "Failed to save design" };
    }
  },

  updateDesign: async (id, design) => {
    try {
      const { error } = await supabase
        .from("designs")
        .update({
          title: design.room.name,
          room_config: design.room,
          items: design.items,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        designs: state.designs.map((d) =>
          d.id === id ? { ...design, id, updatedAt: new Date().toISOString() } : d
        ),
      }));

      return { success: true };
    } catch (error: any) {
      console.error("Error updating design:", error);
      return { success: false, error: error.message };
    }
  },

  deleteDesign: async (id) => {
    try {
      const { error } = await supabase.from("designs").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        designs: state.designs.filter((d) => d.id !== id),
      }));

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting design:", error);
      return { success: false, error: error.message };
    }
  },

  getDesign: (id) => {
    return get().designs.find((d) => d.id === id);
  },

  getDesignsByUser: (userId) => {
    return get().designs.filter((d) => d.userId === userId);
  },
}));

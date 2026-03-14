"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, type Designer } from "@/lib/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
  full_name?: string;
  company_name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  designer?: Designer;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<Designer>) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return { success: false, error: error.message };
          }

          if (data.user) { 
            const { data: designer } = await supabase
              .from('designers')
              .select('*')
              .eq('id', data.user.id)
              .single();

            set({
              user: {
                id: data.user.id,
                name: designer?.full_name || data.user.email?.split('@')[0] || 'Designer',
                email: data.user.email || '',
                full_name: designer?.full_name,
                company_name: designer?.company_name,
                phone: designer?.phone,
                bio: designer?.bio,
                avatar_url: designer?.avatar_url,
                designer,
              },
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true };
          }

          return { success: false, error: 'Login failed' };
        } catch (error: any) {
          return { success: false, error: error.message || 'An error occurred' };
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
              },
            },
          });

          if (error) {
            return { success: false, error: error.message };
          }

          if (data.user) {
           
            const { data: designer } = await supabase
              .from('designers')
              .select('*')
              .eq('id', data.user.id)
              .single();

            set({
              user: {
                id: data.user.id,
                name: name,
                email: email,
                full_name: designer?.full_name,
                company_name: designer?.company_name,
                phone: designer?.phone,
                bio: designer?.bio,
                avatar_url: designer?.avatar_url,
                designer,
              },
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true };
          }

          return { success: false, error: 'Registration failed' };
        } catch (error: any) {
          return { success: false, error: error.message || 'An error occurred' };
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: designer } = await supabase
              .from('designers')
              .select('*')
              .eq('id', session.user.id)
              .single();

            set({
              user: {
                id: session.user.id,
                name: designer?.full_name || session.user.email?.split('@')[0] || 'Designer',
                email: session.user.email || '',
                full_name: designer?.full_name,
                company_name: designer?.company_name,
                phone: designer?.phone,
                bio: designer?.bio,
                avatar_url: designer?.avatar_url,
                designer,
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateProfile: async (updates: Partial<Designer>) => {
        const currentUser = get().user;
        if (!currentUser) return { success: false, error: 'Not authenticated' };

        try {
          const { error } = await supabase
            .from('designers')
            .update(updates)
            .eq('id', currentUser.id);

          if (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
          }

          const { data: designer } = await supabase
            .from('designers')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (designer) {
            set({
              user: {
                ...currentUser,
                name: designer.full_name,
                full_name: designer.full_name,
                company_name: designer.company_name,
                phone: designer.phone,
                bio: designer.bio,
                avatar_url: designer.avatar_url,
                designer,
              },
            });
          }

          return { success: true };
        } catch (error: any) {
          console.error('Profile update error:', error);
          return { success: false, error: error.message };
        }
      },
    }),
    { name: "auth-storage" }
  )
);

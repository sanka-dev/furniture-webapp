"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export interface Designer {
  id: string;
  full_name: string;
  email: string;
  company_name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Design {
  id: string;
  designer_id: string;
  title: string;
  description?: string;
  room_config: any; 
  items: any[]; 
  thumbnail_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  designer_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  designer_id: string;
  client_id?: string;
  design_id?: string;
  name: string;
  status: 'draft' | 'in_progress' | 'pending_approval' | 'approved' | 'completed' | 'cancelled';
  budget?: number;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  design?: Design;
}

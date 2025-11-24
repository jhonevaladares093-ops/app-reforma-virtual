import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types para o banco de dados
export type Project = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type Environment = {
  id: string;
  project_id: string;
  name: string;
  decorations: {
    wall?: string;
    floor?: string;
    furniture?: string;
    light?: string;
    ceiling?: string;
  };
  measurements: {
    area?: string;
    distance?: string;
  };
  created_at: string;
  updated_at: string;
};

export type ARHistory = {
  id: string;
  environment_id: string;
  user_id: string;
  snapshot: any;
  created_at: string;
};

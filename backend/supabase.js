import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.warn('⚠️  Missing Supabase environment variables. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  console.warn('Authentication features will not work properly without valid Supabase configuration.');
}

let supabaseAdmin = null;
let supabase = null;

// Only create clients if environment variables are present
if (supabaseUrl && supabaseServiceKey && supabaseAnonKey) {
  // Admin client for server-side operations
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Client for handling user auth
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabaseAdmin, supabase };
export default supabase;

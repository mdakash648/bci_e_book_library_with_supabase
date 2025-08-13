import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahjdgcoixcncwyfmtcmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoamRnY29peGNuY3d5Zm10Y216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzQzMjYsImV4cCI6MjA3MDQxMDMyNn0.JQulx8mK4t1EPmXOeUvK8BaWY8BGIzMtiqibibcKXOM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

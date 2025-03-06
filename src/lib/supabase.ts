import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback values for development if environment variables are not available
const fallbackUrl = 'https://xbnkaxrtelztsyisruke.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmtheHJ0ZWx6dHN5aXNydWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NjgyMzksImV4cCI6MjA1NjA0NDIzOX0.Jtha-zilPf1VkWhldPGiMbUllXupVX9OfBOKlXsxGGU';

// Use environment variables or fallback to hardcoded values
const url = supabaseUrl || fallbackUrl;
const key = supabaseAnonKey || fallbackKey;

// Create and export the Supabase client with retries
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js/2.39.3'
    }
  },
  db: {
    schema: 'public'
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);
  
  if (error.code === 'PGRST116') {
    return 'No data found';
  }
  
  if (error.code === '23505') {
    return 'This record already exists';
  }
  
  if (error.code === '42703') {
    return 'Database schema error: Column does not exist';
  }
  
  if (error.message?.includes('Failed to fetch')) {
    return 'Connection error: Unable to reach database';
  }
  
  return error.message || 'An unexpected error occurred';
};

// Helper function to check if Supabase is available
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('admin_roles').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};
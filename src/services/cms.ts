import { supabase } from '../lib/supabase';
import slugify from 'slugify';

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const generateSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true
  });
};

export const createPage = async (data: Omit<CMSPage, 'id' | 'created_at' | 'updated_at'>): Promise<CMSPage> => {
  try {
    const { data: page, error } = await supabase
      .from('cms_pages')
      .insert([{
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return page;
  } catch (error) {
    console.error('Error creating page:', error);
    throw error;
  }
};

export const updatePage = async (id: string, data: Partial<CMSPage>): Promise<CMSPage> => {
  try {
    const { data: page, error } = await supabase
      .from('cms_pages')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return page;
  } catch (error) {
    console.error('Error updating page:', error);
    throw error;
  }
};

export const deletePage = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cms_pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting page:', error);
    throw error;
  }
};

export const getPages = async (): Promise<CMSPage[]> => {
  try {
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
};

export const getPageBySlug = async (slug: string): Promise<CMSPage | null> => {
  try {
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
};
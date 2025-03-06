import { supabase } from '../lib/supabase';
import { sendEmail, getContactFormEmailTemplate, getContactReplyTemplate } from './email';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submitted_at: string;
  status: 'new' | 'read' | 'replied' | 'archived';
}

/**
 * Submit contact form data to Supabase and send email notification
 */
export const submitContactForm = async (formData: ContactFormData): Promise<boolean> => {
  try {
    // Save contact form submission to Supabase
    const { error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          submitted_at: new Date().toISOString(),
          status: 'new'
        }
      ]);
    
    if (error) {
      console.error('Error saving contact form to Supabase:', error);
      return false;
    }
    
    // Send email notification to admin
    const adminEmail = 'laljij@etherauthority.io';
    const emailHtml = getContactFormEmailTemplate(
      formData.name,
      formData.email,
      formData.subject,
      formData.message
    );
    
    const emailSent = await sendEmail({
      to: adminEmail,
      subject: `New Contact Form: ${formData.subject}`,
      html: emailHtml,
      from: 'noreply@gsdt.com'
    });
    
    return emailSent;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return false;
  }
};

/**
 * Get all contact form submissions
 */
export const getContactSubmissions = async (): Promise<ContactSubmission[]> => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching contact submissions:', error);
      return [];
    }
    
    return data as ContactSubmission[];
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return [];
  }
};

/**
 * Get a single contact submission by ID
 */
export const getContactSubmission = async (id: string): Promise<ContactSubmission | null> => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching contact submission:', error);
      return null;
    }
    
    return data as ContactSubmission;
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    return null;
  }
};

/**
 * Update contact submission status
 */
export const updateContactStatus = async (id: string, status: 'new' | 'read' | 'replied' | 'archived'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating contact status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating contact status:', error);
    return false;
  }
};

/**
 * Delete a contact submission
 */
export const deleteContactSubmission = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting contact submission:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    return false;
  }
};

/**
 * Send a reply to a contact submission
 */
export const sendContactReply = async (submission: ContactSubmission, replyText: string): Promise<boolean> => {
  try {
    // Send email to the user
    const emailHtml = getContactReplyTemplate(
      submission.name,
      submission.subject,
      replyText
    );
    
    const emailSent = await sendEmail({
      to: submission.email,
      subject: `Re: ${submission.subject}`,
      html: emailHtml,
      from: 'support@gsdt.com'
    });
    
    if (emailSent) {
      // Update submission status to replied
      const updated = await updateContactStatus(submission.id, 'replied');
      return updated;
    }
    
    return false;
  } catch (error) {
    console.error('Error sending reply:', error);
    return false;
  }
};
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { supabase } from '../lib/supabase';
import { KYCStatus, submitSumsubKYCRequest, updateKYCWithSumsubData } from './kyc';

// SumSub configuration
const SUMSUB_APP_TOKEN = import.meta.env.VITE_SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = import.meta.env.VITE_SUMSUB_SECRET_KEY;

// Mock data for development/testing
const MOCK_ACCESS_TOKEN = 'mock-access-token-' + uuidv4();

export interface SumsubWebhookPayload {
  applicantId: string;
  externalUserId: string;
  type: string;
  reviewStatus: string;
  reviewResult: string;
  moderationComment?: string;
  [key: string]: any;
}

// Get access token for SumSub SDK
export const getSumsubAccessToken = async (userAddress: string, applicantId?: string): Promise<string> => {
  try {
    // For development/testing, return mock token
    if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
      console.warn('SumSub credentials not configured, using mock token');
      return MOCK_ACCESS_TOKEN;
    }

    // In production, this would call your backend to get a token
    // For now, return mock token since we can't make direct API calls
    return MOCK_ACCESS_TOKEN;
  } catch (error) {
    console.error('Error getting SumSub access token:', error);
    return MOCK_ACCESS_TOKEN;
  }
};

// Create a new applicant
export const createSumsubApplicant = async (userAddress: string): Promise<string | null> => {
  try {
    // For development/testing
    if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
      const mockApplicantId = 'mock-applicant-' + uuidv4();
      
      // Store mock applicant in Supabase with valid status
      await supabase.from('sumsub_applicants').insert([{
        user_address: userAddress.toLowerCase(),
        applicant_id: mockApplicantId,
        status: 'init', // Changed from 'created' to match status_check constraint
        created_at: new Date().toISOString()
      }]);
      
      return mockApplicantId;
    }

    // In production, this would call your backend
    // For now, create a mock applicant
    const mockApplicantId = 'mock-applicant-' + uuidv4();
    
    // Store in Supabase with valid status
    await supabase.from('sumsub_applicants').insert([{
      user_address: userAddress.toLowerCase(),
      applicant_id: mockApplicantId,
      status: 'init', // Changed from 'created' to match status_check constraint
      created_at: new Date().toISOString()
    }]);
    
    return mockApplicantId;
  } catch (error) {
    console.error('Error creating SumSub applicant:', error);
    return null;
  }
};

// Verify webhook signature
export const verifySumsubWebhookSignature = (signature: string, payload: string): boolean => {
  try {
    if (!SUMSUB_SECRET_KEY) return true; // Skip verification in test mode
    
    const calculatedSignature = CryptoJS.HmacSHA256(payload, SUMSUB_SECRET_KEY).toString(CryptoJS.enc.Hex);
    return calculatedSignature === signature;
  } catch (error) {
    console.error('Error verifying SumSub webhook signature:', error);
    return false;
  }
};

// Process webhook
export const processSumsubWebhook = async (payload: SumsubWebhookPayload): Promise<boolean> => {
  try {
    // Store webhook data in Supabase for audit trail
    await supabase.from('sumsub_webhooks').insert([{
      applicant_id: payload.applicantId,
      event_type: payload.type,
      payload: payload,
      created_at: new Date().toISOString()
    }]);

    // Map webhook status to valid status
    let status = 'pending'; // Default status
    switch (payload.reviewStatus) {
      case 'completed':
        status = 'completed';
        break;
      case 'rejected':
        status = 'rejected';
        break;
      case 'pending':
        status = 'pending';
        break;
      default:
        status = 'init';
    }

    // Update applicant status
    await supabase.from('sumsub_applicants').update({
      status: status,
      webhook_data: payload,
      updated_at: new Date().toISOString()
    }).eq('applicant_id', payload.applicantId);

    return true;
  } catch (error) {
    console.error('Error processing SumSub webhook:', error);
    return false;
  }
};
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { supabase } from '../lib/supabase';
import { KYCStatus, submitKYCRequest, updateKYCWithSumsubData } from './kyc';
import axios from 'axios';

// SumSub configuration
const SUMSUB_APP_TOKEN = import.meta.env.VITE_SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = import.meta.env.VITE_SUMSUB_SECRET_KEY;
const SUMSUB_NODE_API_URL = import.meta.env.VITE_SUMSUB_NODE_API_URL;

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

    const response = await fetch(SUMSUB_NODE_API_URL+'/create-access-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userAddress }),
    });
    
    const data = await response.json();    
    if(data.status){
       return data.response.token;
    } else {
      return null
    }
   
  } catch (error) {
    console.error('Error getting SumSub access token:', error);
    return null;
  }
};

// Create a new applicant
export const createSumsubApplicant = async (userAddress: string): Promise<string | null> => {
  try {
    const response = await fetch(SUMSUB_NODE_API_URL+'/create-applicant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userAddress }),
    });
    
    const data = await response.json();    
    if(data.status){
       return data.applicant_id;
    } else {
      return null
    }
    
  } catch (error) {
    console.error('Error creating SumSub applicant:', error);
    return null;
  }
};

// Get applicant status
export const getSumsubApplicantStatus = async (userAddress: string, applicantId?: string): Promise<any> => {
  try {
    const response = await fetch(SUMSUB_NODE_API_URL+'/get-applicant-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ applicantId, userAddress }),
    });
    
    const data = await response.json();    
    if(data.status){
       return data.response;
    } else {
      return null
    }
   
  } catch (error) {
    console.error('Error getting SumSub applicant status:', error);
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
    let status = KYCStatus.PENDING; // Default status
    switch (payload.reviewStatus) {
      case 'completed':
        status = payload.reviewResult === 'GREEN' ? KYCStatus.APPROVED : KYCStatus.REJECTED;
        break;
      case 'rejected':
        status = KYCStatus.REJECTED;
        break;
      default:
        status = KYCStatus.PENDING;
    }

    // Update KYC status in database and blockchain
    await updateKYCWithSumsubData(
      payload.externalUserId,
      payload.applicantId,
      payload,
      status,
      payload.moderationComment
    );

    return true;
  } catch (error) {
    console.error('Error processing SumSub webhook:', error);
    return false;
  }
};
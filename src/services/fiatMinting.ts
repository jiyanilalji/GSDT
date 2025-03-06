import { supabase } from '../lib/supabase';
import { getContract } from '../lib/web3';
import { ethers } from 'ethers';

export enum FiatMintStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface FiatMintRequest {
  id: string;
  user_address: string;
  amount: number;
  currency: string;
  status: FiatMintStatus;
  payment_reference: string;
  payment_proof_url?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
  processed_at?: string;
  processed_by?: string;
}

export const createFiatMintRequest = async (
  userAddress: string,
  amount: number,
  currency: string,
  paymentReference: string,
  paymentProofUrl?: string
): Promise<FiatMintRequest> => {
  try {
    const { data, error } = await supabase
      .from('fiat_mint_requests')
      .insert([{
        user_address: userAddress.toLowerCase(),
        amount,
        currency,
        status: FiatMintStatus.PENDING,
        payment_reference: paymentReference,
        payment_proof_url: paymentProofUrl,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as FiatMintRequest;
  } catch (error) {
    console.error('Error creating fiat mint request:', error);
    throw error;
  }
};

export const getFiatMintRequests = async (status?: FiatMintStatus): Promise<FiatMintRequest[]> => {
  try {
    let query = supabase
      .from('fiat_mint_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as FiatMintRequest[];
  } catch (error) {
    console.error('Error fetching fiat mint requests:', error);
    throw error;
  }
};

export const getUserFiatMintRequests = async (userAddress: string): Promise<FiatMintRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('fiat_mint_requests')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as FiatMintRequest[];
  } catch (error) {
    console.error('Error fetching user fiat mint requests:', error);
    throw error;
  }
};

export const approveFiatMintRequest = async (
  requestId: string,
  adminAddress: string,
  notes?: string
): Promise<boolean> => {
  try {
    // Get the request details
    const { data: request, error: fetchError } = await supabase
      .from('fiat_mint_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;
    if (!request) throw new Error('Request not found');

    // Get the contract instance
    const contract = getContract();
    if (!contract) throw new Error('Contract not initialized');

    // Mint the tokens
    const tx = await contract.mint(
      request.user_address,
      ethers.utils.parseEther(request.amount.toString())
    );
    await tx.wait();

    // Update the request status
    const { error: updateError } = await supabase
      .from('fiat_mint_requests')
      .update({
        status: FiatMintStatus.APPROVED,
        admin_notes: notes,
        processed_at: new Date().toISOString(),
        processed_by: adminAddress.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error('Error approving fiat mint request:', error);
    throw error;
  }
};

export const rejectFiatMintRequest = async (
  requestId: string,
  adminAddress: string,
  notes: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('fiat_mint_requests')
      .update({
        status: FiatMintStatus.REJECTED,
        admin_notes: notes,
        processed_at: new Date().toISOString(),
        processed_by: adminAddress.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error rejecting fiat mint request:', error);
    throw error;
  }
};
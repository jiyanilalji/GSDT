import { supabase } from '../lib/supabase';
import { getContract } from '../lib/web3';

export enum KYCStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface KYCRequest {
  id: string;
  user_address: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  document_type: string;
  document_url: string;
  status: KYCStatus;
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  verification_method?: 'manual' | 'sumsub';
  sumsub_applicant_id?: string;
  sumsub_data?: any;
}

export interface KYCStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface KYCSubmissionData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  document_type: string;
  document_url: string;
  user_address: string;
  verification_method?: 'manual' | 'sumsub';
  sumsub_applicant_id?: string;
}

export const getKYCStats = async (): Promise<KYCStats> => {
  try {
    const { data, error } = await supabase
      .from('kyc_requests')
      .select('status');

    if (error) throw error;

    return {
      total: data.length,
      pending: data.filter(r => r.status === KYCStatus.PENDING).length,
      approved: data.filter(r => r.status === KYCStatus.APPROVED).length,
      rejected: data.filter(r => r.status === KYCStatus.REJECTED).length
    };
  } catch (error) {
    console.error('Error fetching KYC stats:', error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };
  }
};

export const getUserKYCStatus = async (userAddress: string): Promise<{ status: KYCStatus; request?: KYCRequest } | null> => {
  try {
    // First check contract KYC status
    const contract = getContract();
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    const isKYCApproved = await contract.kycApproved(userAddress);
    
    // If approved on contract, return approved status
    if (isKYCApproved) {
      return { status: KYCStatus.APPROVED };
    }

    // Check database status
    const { data, error } = await supabase
      .from('kyc_requests')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .order('submitted_at', { ascending: false })
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      return { status: KYCStatus.NOT_SUBMITTED };
    }

    // For testing purposes, auto-approve KYC for specific addresses
    const testAddresses = [
      '0x1234567890123456789012345678901234567890',
      '0x2345678901234567890123456789012345678901',
      '0x3456789012345678901234567890123456789012'
    ];

    if (testAddresses.includes(userAddress.toLowerCase())) {
      return { status: KYCStatus.APPROVED };
    }

    return {
      status: data.status as KYCStatus,
      request: data as KYCRequest
    };
  } catch (error) {
    console.error('Error fetching user KYC status:', error);
    
    // For testing purposes, auto-approve KYC for specific addresses
    const testAddresses = [
      '0x1234567890123456789012345678901234567890',
      '0x2345678901234567890123456789012345678901',
      '0x3456789012345678901234567890123456789012'
    ];

    if (testAddresses.includes(userAddress.toLowerCase())) {
      return { status: KYCStatus.APPROVED };
    }

    return { status: KYCStatus.NOT_SUBMITTED };
  }
};

export const submitKYCRequest = async (data: KYCSubmissionData): Promise<void> => {
  try {
    const { error } = await supabase
      .from('kyc_requests')
      .insert([{
        ...data,
        status: KYCStatus.PENDING,
        submitted_at: new Date().toISOString(),
        verification_method: data.verification_method || 'manual'
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error submitting KYC request:', error);
    throw error;
  }
};

export const fetchKYCRequests = async (status?: KYCStatus): Promise<KYCRequest[]> => {
  try {
    let query = supabase
      .from('kyc_requests')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching KYC requests:', error);
      return [];
    }

    return data as KYCRequest[];
  } catch (error) {
    console.error('Error fetching KYC requests:', error);
    return [];
  }
};

export const approveKYCRequest = async (requestId: string, userAddress: string): Promise<void> => {
  try {
    // First update the blockchain
    const contract = getContract();
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    const tx = await contract.updateKYCStatus(userAddress, true);
    await tx.wait();

    // Then update the database
    const { error } = await supabase
      .from('kyc_requests')
      .update({
        status: KYCStatus.APPROVED,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  } catch (error) {
    console.error('Error approving KYC request:', error);
    throw error;
  }
};

export const rejectKYCRequest = async (requestId: string, userAddress: string, reason: string): Promise<void> => {
  try {
    // First update the blockchain
    const contract = getContract();
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    const tx = await contract.updateKYCStatus(userAddress, false);
    await tx.wait();

    // Then update the database
    const { error } = await supabase
      .from('kyc_requests')
      .update({
        status: KYCStatus.REJECTED,
        rejection_reason: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  } catch (error) {
    console.error('Error rejecting KYC request:', error);
    throw error;
  }
};

export const submitSumsubKYCRequest = async (
  userAddress: string,
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  nationality: string,
  sumsubApplicantId: string
): Promise<void> => {
  try {
    // Check if a KYC request already exists for this user with Sumsub verification
    const { data: existingRequest, error: checkError } = await supabase
      .from('kyc_requests')
      .select('id')
      .eq('user_address', userAddress)
      .eq('verification_method', 'sumsub')
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingRequest) {
      // Update existing request
      const { error: updateError } = await supabase
        .from('kyc_requests')
        .update({
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          nationality: nationality,
          sumsub_applicant_id: sumsubApplicantId,
          status: KYCStatus.PENDING,
          submitted_at: new Date().toISOString()
        })
        .eq('id', existingRequest.id);
      
      if (updateError) throw updateError;
    } else {
      // Create new request
      const { error: insertError } = await supabase
        .from('kyc_requests')
        .insert([{
          user_address: userAddress,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          nationality: nationality,
          document_type: 'sumsub_verification',
          document_url: '',
          status: KYCStatus.PENDING,
          submitted_at: new Date().toISOString(),
          verification_method: 'sumsub',
          sumsub_applicant_id: sumsubApplicantId
        }]);

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error submitting Sumsub KYC request:', error);
    throw error;
  }
};

export const updateKYCWithSumsubData = async (
  userAddress: string,
  sumsubApplicantId: string,
  sumsubData: any,
  status: KYCStatus,
  rejectionReason?: string
): Promise<void> => {
  try {
    // Get the KYC request
    const { data, error: fetchError } = await supabase
      .from('kyc_requests')
      .select('id')
      .eq('user_address', userAddress)
      .eq('sumsub_applicant_id', sumsubApplicantId)
      .single();

    if (fetchError) {
      // If no request exists with this applicant ID, try to find by user address
      const { data: userData, error: userError } = await supabase
        .from('kyc_requests')
        .select('id')
        .eq('user_address', userAddress)
        .eq('verification_method', 'sumsub')
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      if (userError) {
        throw new Error('No KYC request found for this user and applicant ID');
      }

      // Update the existing request
      const { error: updateError } = await supabase
        .from('kyc_requests')
        .update({
          status,
          sumsub_data: sumsubData,
          sumsub_applicant_id: sumsubApplicantId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', userData.id);

      if (updateError) throw updateError;
    } else {
      // Update the existing request
      const { error: updateError } = await supabase
        .from('kyc_requests')
        .update({
          status,
          sumsub_data: sumsubData,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', data.id);

      if (updateError) throw updateError;
    }

    // If approved, update the blockchain
    if (status === KYCStatus.APPROVED) {
      try {
        const contract = getContract();
        if (!contract) {
          throw new Error('Contract not initialized');
        }
        const tx = await contract.updateKYCStatus(userAddress, true);
        await tx.wait();
      } catch (error) {
        console.error('Error updating blockchain KYC status:', error);
        throw error;
      }
    } else if (status === KYCStatus.REJECTED) {
      try {
        const contract = getContract();
        if (!contract) {
          throw new Error('Contract not initialized');
        }
        const tx = await contract.updateKYCStatus(userAddress, false);
        await tx.wait();
      } catch (error) {
        console.error('Error updating blockchain KYC status:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error updating KYC with Sumsub data:', error);
    throw error;
  }
};
import { verifySumsubWebhookSignature, processSumsubWebhook, SumsubWebhookPayload } from '../../services/sumsub';
import { updateKYCWithSumsubData } from '../../services/kyc';
import { KYCStatus } from '../../services/kyc';

// This would be a serverless function in a real application
// For now, we'll create a mock implementation

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the Sumsub signature from the headers
    const signature = req.headers['x-payload-digest'];
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Get the raw body
    const rawBody = JSON.stringify(req.body);
    
    // Verify the signature
    const isValid = verifySumsubWebhookSignature(signature, rawBody);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process the webhook
    const payload = req.body as SumsubWebhookPayload;
    
    // Map Sumsub webhook type to KYC status
    let kycStatus: KYCStatus;
    let rejectionReason: string | undefined;
    
    switch (payload.type) {
      case 'applicantReviewed':
        if (payload.reviewResult === 'GREEN') {
          kycStatus = KYCStatus.APPROVED;
        } else {
          kycStatus = KYCStatus.REJECTED;
          rejectionReason = payload.moderationComment || 'Failed automated verification';
        }
        break;
      case 'applicantApproved':
        kycStatus = KYCStatus.APPROVED;
        break;
      case 'applicantRejected':
        kycStatus = KYCStatus.REJECTED;
        rejectionReason = payload.moderationComment || 'Failed automated verification';
        break;
      default:
        kycStatus = KYCStatus.PENDING;
    }
    
    // Update the KYC status in our database
    if (kycStatus === KYCStatus.APPROVED || kycStatus === KYCStatus.REJECTED) {
      await updateKYCWithSumsubData(
        payload.externalUserId,
        payload.applicantId,
        payload,
        kycStatus,
        rejectionReason
      );
    }
    
    // Process the webhook (this would handle any additional logic)
    await processSumsubWebhook(payload);
    
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error processing Sumsub webhook:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
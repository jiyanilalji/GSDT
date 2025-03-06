import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { KYCStatus, getUserKYCStatus } from '../services/kyc';
import { getSumsubAccessToken, createSumsubApplicant } from '../services/sumsub';

// Import the SumSub WebSDK
declare global {
  interface Window {
    SumsubWebSdk?: any;
  }
}

export default function SumsubKYC() {
  const { address, isConnected } = useWallet();
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.NOT_SUBMITTED);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [applicantId, setApplicantId] = useState<string | null>(null);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<any>(null);

  // Check KYC status
  useEffect(() => {
    if (!isConnected || !address) return;

    const checkKYCStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check current KYC status
        const kycResponse = await getUserKYCStatus(address);
        setKycStatus(kycResponse?.status || KYCStatus.NOT_SUBMITTED);

        // If KYC is not approved or rejected, prepare SumSub integration
        if (kycResponse?.status !== KYCStatus.APPROVED && kycResponse?.status !== KYCStatus.REJECTED) {
          try {
            // Create or get applicant ID
            let appId = kycResponse?.request?.sumsub_applicant_id;
            
            // Fix: Properly check if appId is undefined or falsy
            if (!appId) {
              try {
                appId = await createSumsubApplicant(address);
                if (appId) {
                  setApplicantId(appId);
                } else {
                  throw new Error("Failed to create Sumsub applicant");
                }
              } catch (createError) {
                console.error("Error creating Sumsub applicant:", createError);
                setError("Unable to initialize verification. Please try the manual verification method.");
                return;
              }
            } else {
              setApplicantId(appId);
            }

            // Get access token
            if (appId) {
              try {
                const token = await getSumsubAccessToken(address, appId);
                setAccessToken(token);
              } catch (tokenError) {
                console.error("Error getting access token:", tokenError);
                setError("Unable to get verification access. Please try the manual verification method.");
              }
            }
          } catch (err) {
            console.error('Error preparing SumSub integration:', err);
            setError("There was a problem setting up the verification. Please try the manual verification method.");
          }
        }
      } catch (error: any) {
        console.error('Error checking KYC status:', error);
        setError('Error checking KYC status. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    checkKYCStatus();
  }, [address, isConnected]);

  // Initialize SumSub SDK when access token is available
  useEffect(() => {
    if (!accessToken || !containerRef.current || sdkInitialized) return;

    const initSumsubSDK = async () => {
      try {
        // Load SumSub SDK script if not already loaded
        if (!window.SumsubWebSdk) {
          const script = document.createElement('script');
          script.src = 'https://static.sumsub.com/idensic/static/sns-websdk-builder.js';
          script.async = true;
          document.body.appendChild(script);
          
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        // Initialize SumSub SDK
        if (window.SumsubWebSdk && containerRef.current) {
          launcherRef.current = window.SumsubWebSdk.init(
            accessToken,
            {
              onMessage: (type: string, payload: any) => {
                console.log('SumSub message:', type, payload);
                
                // Handle specific events
                if (type === 'idCheck.applicantReviewed') {
                  // Refresh KYC status when applicant is reviewed
                  if (address) {
                    getUserKYCStatus(address).then(response => {
                      setKycStatus(response?.status || KYCStatus.PENDING);
                    });
                  }
                }
              },
              onError: (error: any) => {
                console.error('SumSub error:', error);
                setError('Error during verification process. Please try again later.');
              }
            }
          );

          // Launch SumSub verification flow
          launcherRef.current.launch('#sumsub-kyc-container');
          setSdkInitialized(true);
        }
      } catch (err) {
        console.error('Error initializing SumSub SDK:', err);
        setError('Error initializing verification. Please try again later.');
      }
    };

    initSumsubSDK();

    // Cleanup function
    return () => {
      if (launcherRef.current) {
        try {
          launcherRef.current.destroy();
        } catch (err) {
          console.error('Error destroying SumSub SDK:', err);
        }
      }
    };
  }, [accessToken, address]);

  const handleManualVerification = () => {
    // Instead of redirecting, we'll use the parent component's state to switch tabs
    const dashboardElement = document.querySelector('[data-kyc-method="manual"]');
    if (dashboardElement) {
      dashboardElement.click();
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="text-center">
          <p className="text-gray-600">Connect your wallet to start KYC verification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">KYC Verification</h3>
      </div>

      {kycStatus === KYCStatus.APPROVED && (
        <div className="text-green-700 bg-green-50 rounded-lg p-4">
          <p className="font-medium">KYC Verified</p>
          <p className="text-sm mt-1">Your identity has been verified. You can now use all features.</p>
        </div>
      )}

      {kycStatus === KYCStatus.REJECTED && (
        <div className="text-red-700 bg-red-50 rounded-lg p-4">
          <p className="font-medium">Verification Failed</p>
          <p className="text-sm mt-1">Your KYC verification was rejected. Please try again with correct information.</p>
          
          <div className="mt-4 flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Reset SumSub SDK
                setSdkInitialized(false);
                // Get new access token
                if (address && applicantId) {
                  getSumsubAccessToken(address, applicantId)
                    .then(token => {
                      setAccessToken(token);
                    })
                    .catch(err => {
                      console.error('Error getting new access token:', err);
                      setError('Error restarting verification. Please try again later.');
                    });
                } else {
                  setError('Missing applicant information. Please try manual verification.');
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium"
            >
              Try Again with SumSub
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualVerification}
              className="px-4 py-2 bg-secondary-600 text-white rounded-md text-sm font-medium"
            >
              Try Manual Verification
            </motion.button>
          </div>
        </div>
      )}

      {kycStatus === KYCStatus.PENDING && (
        <div className="text-yellow-700 bg-yellow-50 rounded-lg p-4">
          <p className="font-medium">Under Review</p>
          <p className="text-sm mt-1">Your verification is being processed. This usually takes 1-2 business days.</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="ml-3 text-gray-600">Checking verification status...</p>
        </div>
      )}

      {error && (
        <div className="text-red-700 bg-red-50 rounded-lg p-4 mt-4">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
          
          <div className="mt-4 flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setError(null);
                if (address) {
                  getUserKYCStatus(address).then(response => {
                    setKycStatus(response?.status || KYCStatus.NOT_SUBMITTED);
                  });
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium"
            >
              Try Again
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualVerification}
              className="px-4 py-2 bg-secondary-600 text-white rounded-md text-sm font-medium"
            >
              Try Manual Verification
            </motion.button>
          </div>
        </div>
      )}

      {(kycStatus === KYCStatus.NOT_SUBMITTED) && !isLoading && !error && (
        <div>
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900">Automated Verification</h4>
            <p className="text-sm text-gray-600 mt-2">
              Complete your identity verification quickly and securely using our automated system.
              You'll need to provide a valid ID document and take a selfie.
            </p>
            
            {/* SumSub container */}
            <div 
              id="sumsub-kyc-container" 
              ref={containerRef}
              className="mt-6 border border-gray-200 rounded-lg min-h-[400px] flex items-center justify-center"
            >
              {!accessToken ? (
                <p className="text-gray-500">Preparing verification system...</p>
              ) : !sdkInitialized ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="mt-4 text-gray-600">Loading verification system...</p>
                </div>
              ) : null}
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900">Manual Verification</h4>
            <p className="text-sm text-gray-600 mt-2">
              If you prefer, you can also complete verification by manually submitting your documents.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualVerification}
              className="mt-4 px-4 py-2 bg-secondary-600 text-white rounded-md text-sm font-medium"
            >
              Manual Verification
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useGSDTPrice } from '../services/exchangeRates';
import { useGSDTContract } from '../hooks/useContract';
import { createFiatMintRequest, getUserFiatMintRequests, FiatMintRequest, FiatMintStatus } from '../services/fiatMinting';
import { format } from 'date-fns';
import { getUserKYCStatus, KYCStatus } from '../services/kyc';

export default function FiatMinting() {
  const { address, isConnected } = useWallet();
  const { price: gsdtPrice, rates } = useGSDTPrice();
  const contract = useGSDTContract();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>('');
  const [success, setSuccess] = useState('');
  const [gsdtAmount, setGsdtAmount] = useState('0');
  const [minMintAmount, setMinMintAmount] = useState<string>('100'); // Default min amount
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [userRequests, setUserRequests] = useState<FiatMintRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.NOT_SUBMITTED);
  const [checkingKYC, setCheckingKYC] = useState(true);

  // Available currencies with their display names
  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'CNH', name: 'Chinese Yuan' },
    { code: 'RUB', name: 'Russian Ruble' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'IDR', name: 'Indonesian Rupiah' }
  ];

  // Check KYC status
  useEffect(() => {
    const checkKYC = async () => {
      if (!address) return;
      
      try {
        setCheckingKYC(true);
        const response = await getUserKYCStatus(address);
        setKycStatus(response.status);
      } catch (err) {
        console.error('Error checking KYC status:', err);
        setKycStatus(KYCStatus.NOT_SUBMITTED);
      } finally {
        setCheckingKYC(false);
      }
    };

    checkKYC();
  }, [address]);

  // Load user's previous requests
  useEffect(() => {
    const loadUserRequests = async () => {
      if (!address) return;
      
      try {
        setLoadingRequests(true);
        const requests = await getUserFiatMintRequests(address);
        setUserRequests(requests);
      } catch (err) {
        console.error('Error loading user requests:', err);
      } finally {
        setLoadingRequests(false);
      }
    };

    loadUserRequests();
  }, [address]);

  // Calculate GSDT amount based on fiat amount and current rates
  useEffect(() => {
    if (!amount || !rates || !gsdtPrice) {
      setGsdtAmount('0');
      return;
    }

    try {
      const fiatAmount = parseFloat(amount);
      if (isNaN(fiatAmount)) {
        setGsdtAmount('0');
        return;
      }

      // Convert fiat amount to USDC equivalent
      let usdcAmount = fiatAmount;
      if (currency !== 'USD') {
        usdcAmount = fiatAmount / rates[currency];
      }

      // Convert USDC to GSDT based on current price
      const gsdtAmount = usdcAmount / gsdtPrice;
      setGsdtAmount(gsdtAmount.toFixed(6));
    } catch (err) {
      console.error('Error calculating GSDT amount:', err);
      setGsdtAmount('0');
    }
  }, [amount, currency, rates, gsdtPrice]);

  const generatePaymentReference = () => {
    const ref = `GSDT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setPaymentReference(ref);
    return ref;
  };

  const handleFiatMint = async () => {
    if (!isConnected || !address || !amount || !gsdtAmount) return;

    // Check KYC status first
    if (kycStatus !== KYCStatus.APPROVED) {
      setError('KYC verification is required before minting tokens. Please complete KYC verification first.');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Generate payment reference
      const ref = generatePaymentReference();
      
      // Create fiat mint request in Supabase
      const request = await createFiatMintRequest(
        address,
        parseFloat(amount),
        currency,
        ref
      );

      // Show payment instructions
      setSuccess(`
        Please complete your payment using the following details:
        
        Bank: GSDT Global Bank
        Account Number: 1234567890
        Reference: ${ref}
        Amount: ${amount} ${currency}
        
        Your request has been submitted and tokens will be minted once the payment is verified.
      `);

      // Refresh user requests
      const updatedRequests = await getUserFiatMintRequests(address);
      setUserRequests(updatedRequests);

      // Reset form
      setAmount('');
      setGsdtAmount('0');
    } catch (err: any) {
      console.error('Error creating fiat mint request:', err);
      setError(err.message || 'Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: FiatMintStatus) => {
    switch (status) {
      case FiatMintStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case FiatMintStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case FiatMintStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Connect your wallet to mint tokens with fiat</p>
      </div>
    );
  }

  if (checkingKYC) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Checking KYC status...</p>
      </div>
    );
  }

  if (kycStatus !== KYCStatus.APPROVED) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">KYC Required</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to complete KYC verification before you can mint tokens.
            Please go to the dashboard to complete your KYC verification.
          </p>
          <div className="mt-6">
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Complete KYC
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Mint with Fiat</h3>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            handleFiatMint();
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="fiat-amount" className="block text-sm font-semibold leading-6 text-gray-900">
                Amount
              </label>
              <div className="mt-2.5">
                <input
                  type="number"
                  id="fiat-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                  placeholder="Enter amount"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-semibold leading-6 text-gray-900">
                Currency
              </label>
              <div className="mt-2.5">
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                  disabled={loading}
                >
                  {currencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.name} ({curr.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              You will receive: <span className="font-semibold text-primary-600">{gsdtAmount} GSDT</span>
            </p>
            {gsdtPrice && (
              <p className="text-xs text-gray-500 mt-1">
                Current rate: 1 GSDT = ${gsdtPrice.toFixed(6)} USDC
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Minimum amount: {minMintAmount} GSDT
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 text-green-700 rounded-md text-sm whitespace-pre-line">
              {success}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !amount || parseFloat(gsdtAmount) <= 0}
            className="w-full rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Request Mint'
            )}
          </motion.button>

          <div className="text-xs text-gray-500">
            <p>Connected Wallet: {address}</p>
            <p>Tokens will be minted to your wallet after payment verification</p>
          </div>
        </motion.form>
      </div>

      {/* Previous Requests */}
      {userRequests.length > 0 && (
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Previous Requests</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(request.created_at), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.payment_reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.admin_notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { createPayment, getPaymentStatus, getMinPaymentAmount, getAvailableCurrencies, CurrencyInfo } from '../services/payments';
import { getUserKYCStatus, KYCStatus } from '../services/kyc';

export default function CryptoMinting() {
  const { address, isConnected } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USDC');
  const [availableCurrencies, setAvailableCurrencies] = useState<CurrencyInfo[]>([]);
  const [minAmount, setMinAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.NOT_SUBMITTED);
  const [checkingKYC, setCheckingKYC] = useState(true);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencies = await getAvailableCurrencies();
        setAvailableCurrencies(currencies);
        
        if (currencies.length > 0) {
          const defaultCurrency = currencies.find(c => c.code === 'USDC') || currencies[0];
          setSelectedCurrency(defaultCurrency.code);
          setMinAmount(defaultCurrency.minAmount);
        }
      } catch (err) {
        console.error('Error loading currencies:', err);
      }
    };

    loadCurrencies();
  }, []);

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

  const handleCurrencyChange = async (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    const currency = availableCurrencies.find(c => c.code === currencyCode);
    if (currency) {
      setMinAmount(currency.minAmount);
    }
  };

  const handleCreatePayment = async () => {
    if (!isConnected || !address || !amount) return;

    // Check KYC status first
    if (kycStatus !== KYCStatus.APPROVED) {
      setError('KYC verification is required before minting tokens. Please complete KYC verification first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setPaymentUrl('');
      setPaymentId('');

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum < minAmount) {
        setError(`Minimum amount is ${minAmount} ${selectedCurrency}`);
        return;
      }

      const payment = await createPayment(amountNum, address, selectedCurrency);
      
      // Store payment URL and ID
      setPaymentUrl(payment.payment_url);
      setPaymentId(payment.payment_id);
      
      setSuccess(`Payment request created successfully! Please complete your payment of ${amountNum} ${selectedCurrency}.`);

      // Start polling for payment status
      const pollStatus = setInterval(async () => {
        try {
          const status = await getPaymentStatus(payment.payment_id);
          if (status.payment_status === 'finished' || status.payment_status === 'confirmed') {
            setSuccess('Payment confirmed! Your tokens will be minted shortly.');
            setPaymentUrl(''); // Hide payment link after confirmation
            clearInterval(pollStatus);
          } else if (status.payment_status === 'failed' || status.payment_status === 'expired') {
            setError('Payment failed or expired. Please try again.');
            setPaymentUrl(''); // Hide payment link on failure
            clearInterval(pollStatus);
          }
        } catch (err) {
          console.error('Error polling payment status:', err);
        }
      }, 30000); // Poll every 30 seconds

      // Clear polling after 30 minutes
      setTimeout(() => {
        clearInterval(pollStatus);
        if (paymentUrl) {
          setError('Payment session expired. Please create a new payment.');
          setPaymentUrl('');
        }
      }, 30 * 60 * 1000);

    } catch (err: any) {
      console.error('Error creating payment:', err);
      setError(err.message || 'Error creating payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Connect your wallet to mint tokens with crypto</p>
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
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Mint with Crypto</h3>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          handleCreatePayment();
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="crypto-amount" className="block text-sm font-semibold leading-6 text-gray-900">
              Amount
            </label>
            <div className="mt-2.5">
              <input
                type="number"
                id="crypto-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                placeholder="Enter amount"
                disabled={loading}
                min={minAmount}
                step="any"
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
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                disabled={loading}
              >
                {availableCurrencies.map((curr) => (
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
            Minimum amount: <span className="font-semibold">{minAmount} {selectedCurrency}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Tokens will be minted automatically after payment confirmation
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
            <p className="text-sm">{success}</p>
            {paymentUrl && (
              <div className="mt-4 flex flex-col items-start space-y-4">
                <div className="w-full p-4 bg-white rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Payment Details:</p>
                  <p className="text-sm text-gray-600">Amount: {amount} {selectedCurrency}</p>
                  <p className="text-sm text-gray-600">Payment ID: {paymentId}</p>
                </div>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Complete Payment
                </motion.a>
                <p className="text-xs text-gray-500">
                  Note: Payment link will expire in 30 minutes. Please complete your payment before then.
                </p>
              </div>
            )}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || !amount || parseFloat(amount) < minAmount}
          className="w-full rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2  focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
            'Create Payment'
          )}
        </motion.button>

        <div className="text-xs text-gray-500">
          <p>Connected Wallet: {address}</p>
          <p>Tokens will be minted automatically after payment confirmation</p>
        </div>
      </motion.form>
    </div>
  );
}
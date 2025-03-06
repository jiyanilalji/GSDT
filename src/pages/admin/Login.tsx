import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import { checkAdminRole } from '../../lib/web3';
import { getUserRole, AdminRole } from '../../services/admin';

export default function AdminLogin() {
  const { address, isConnected, connect } = useWallet();
  const { isAdmin, adminRole } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated as admin
    const checkAdminAuth = async () => {
      // If admin auth is in localStorage and we have a role, redirect to dashboard
      if (localStorage.getItem('adminAuth') === 'true' && localStorage.getItem('adminRole')) {
      }
    }
  }
  )
}
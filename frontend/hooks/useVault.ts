import { useState, useEffect } from 'react';
import { getVaultData, getUserVaultData } from '@/lib/contracts';
import type { VaultData, UserData } from '@/types';

export function useVaultData() {
  const [vaultData, setVaultData] = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVaultData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVaultData();
      setVaultData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vault data');
      console.error('Error fetching vault data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchVaultData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    vaultData,
    loading,
    error,
    refresh: fetchVaultData,
  };
}

export function useUserData(userAddress: string | null) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!userAddress) {
      setUserData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserVaultData(userAddress);
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    
    if (userAddress) {
      const interval = setInterval(fetchUserData, 30000);
      return () => clearInterval(interval);
    }
  }, [userAddress]);

  return {
    userData,
    loading,
    error,
    refresh: fetchUserData,
  };
}
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function usePremium() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPremiumStatus();
    } else {
      setIsPremium(false);
      setIsVerified(false);
      setLoading(false);
    }
  }, [user]);

  const fetchPremiumStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium, is_verified')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setIsPremium(data?.is_premium || false);
      setIsVerified(data?.is_verified || false);
    } catch (error) {
      console.error('Error fetching premium status:', error);
      setIsPremium(false);
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const upgradeToPremium = async () => {
    if (!user) return { error: new Error('No user logged in') };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', user.id);
      
      if (!error) {
        setIsPremium(true);
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return {
    isPremium,
    isVerified,
    loading,
    upgradeToPremium,
    refreshStatus: fetchPremiumStatus,
  };
}

export function usePremiumGuard() {
  const { isPremium } = usePremium();
  
  const requirePremium = (callback: () => void) => {
    if (isPremium) {
      callback();
    } else {
      alert('This feature is available for Premium users only. Upgrade to access advanced filters!');
    }
  };

  return { requirePremium, isPremium };
}
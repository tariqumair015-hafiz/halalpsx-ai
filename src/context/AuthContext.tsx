import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BrokerType, TaxStatus, SubscriptionPlan, UserProfile } from '../types';
import { supabase, isDemoMode } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  updateBroker: (broker: BrokerType) => void;
  updateBudget: (budget: number) => void;
  updateTaxStatus: (status: TaxStatus) => void;
  updatePlan: (plan: SubscriptionPlan) => void;
  updateApiKey: (key: string) => void;
  updateGroqApiKey: (key: string) => void;
  updateAiProvider: (provider: 'groq' | 'gemini') => void;
  deductCash: (amount: number) => boolean;
  addCash: (amount: number) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-halal-01',
  email: 'investor@halalpsx.pk',
  full_name: 'Muhammad Ali',
  broker: 'KTrade',
  budget: 50000.00,
  tax_status: 'FILER',
  plan: 'FREE',
  ai_credits: 10,
  ntfy_topic: 'halalpsx-investor-pk',
  gemini_api_key: '',
  groq_api_key: '',
  ai_provider: 'groq',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('halalpsx_user_profile');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('halalpsx_user_profile', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (!isDemoMode) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsAuthenticated(true);
          fetchRemoteProfile(session.user.id, session.user.email || '');
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          fetchRemoteProfile(session.user.id, session.user.email || '');
        } else {
          setIsAuthenticated(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchRemoteProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setUser(prev => ({
          ...prev,
          id: data.user_id,
          email: data.email || email,
          full_name: data.full_name || prev.full_name,
          broker: data.broker as BrokerType,
          budget: Number(data.budget),
          tax_status: data.tax_status as TaxStatus,
          plan: data.plan as SubscriptionPlan,
          ntfy_topic: data.ntfy_topic || prev.ntfy_topic,
        }));
      }
    } catch (e) {
      console.warn('Could not fetch remote profile:', e);
    }
  };

  const updateBroker = (broker: BrokerType) => {
    setUser(prev => ({ ...prev, broker }));
  };

  const updateBudget = (budget: number) => {
    setUser(prev => ({ ...prev, budget: Math.max(0, budget) }));
  };

  const updateTaxStatus = (tax_status: TaxStatus) => {
    setUser(prev => ({ ...prev, tax_status }));
  };

  const updatePlan = (plan: SubscriptionPlan) => {
    setUser(prev => ({ ...prev, plan }));
  };

  const updateApiKey = (gemini_api_key: string) => {
    setUser(prev => ({ ...prev, gemini_api_key }));
  };

  const updateGroqApiKey = (groq_api_key: string) => {
    setUser(prev => ({ ...prev, groq_api_key }));
  };

  const updateAiProvider = (ai_provider: 'groq' | 'gemini') => {
    setUser(prev => ({ ...prev, ai_provider }));
  };

  const deductCash = (amount: number): boolean => {
    if (user.budget >= amount) {
      setUser(prev => ({ ...prev, budget: prev.budget - amount }));
      return true;
    }
    return false;
  };

  const addCash = (amount: number) => {
    setUser(prev => ({ ...prev, budget: prev.budget + amount }));
  };

  const login = async (email: string): Promise<boolean> => {
    setUser(prev => ({ ...prev, email, full_name: email.split('@')[0] }));
    setIsAuthenticated(true);
    return true;
  };

  const signup = async (email: string, _pass: string, name: string): Promise<boolean> => {
    setUser(prev => ({ ...prev, email, full_name: name }));
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        updateBroker,
        updateBudget,
        updateTaxStatus,
        updatePlan,
        updateApiKey,
        updateGroqApiKey,
        updateAiProvider,
        deductCash,
        addCash,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

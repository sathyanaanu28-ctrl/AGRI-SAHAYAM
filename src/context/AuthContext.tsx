import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; demoOtp?: string; error?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_GUEST_USER: User = {
  id: 'guest_farmer_001',
  name: 'Kisan Mitra (Guest)',
  phone: '+91 98765 43210',
  state: 'Maharashtra',
  district: 'Pune',
  village: 'Baramati',
  landSizeAcres: 5,
  crops: ['Paddy Rice', 'Sugarcane', 'Cotton'],
  soilType: 'Black Cotton Soil',
  authMethod: 'guest',
  isGuest: true,
  profileComplete: true,
  createdAt: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('agrisahay_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user session:', e);
      }
    }
    // Default to a friendly ready guest session for seamless first-load access
    return DEFAULT_GUEST_USER;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('agrisahay_auth_user', JSON.stringify(user));
      localStorage.setItem(`agrisahay_user_profile_${user.id}`, JSON.stringify(user));
    } else {
      localStorage.removeItem('agrisahay_auth_user');
    }
  }, [user]);

  const sendOtp = async (phone: string) => {
    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        throw new Error('Please enter a valid 10-digit mobile number.');
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoCode(otp);
      await new Promise((r) => setTimeout(r, 600));
      return { success: true, demoOtp: otp };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to send OTP' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    setIsLoading(true);
    try {
      if (otp !== demoCode && otp !== '123456') {
        throw new Error('Invalid verification code. Please enter the 6-digit OTP.');
      }
      const userId = 'farmer_' + phone.replace(/\D/g, '');
      const savedProfile = localStorage.getItem(`agrisahay_user_profile_${userId}`);
      let existing: User;
      if (savedProfile) {
        existing = JSON.parse(savedProfile);
      } else {
        existing = {
          id: userId,
          authMethod: 'phone',
          name: 'Farmer ' + phone.slice(-4),
          phone,
          isGuest: false,
          profileComplete: false,
          createdAt: new Date().toISOString()
        };
      }
      setUser(existing);
      setDemoCode(null);
      return { success: true, isNewUser: !existing.profileComplete };
    } catch (e: any) {
      return { success: false, error: e.message || 'Verification failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Friendly simulation of Google OAuth / Workspace integration
      const googleUser: User = {
        id: 'google_farmer_' + Date.now(),
        name: 'Kisan Patil',
        email: 'farmer.kisan@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22521?auto=format&fit=crop&w=200&q=80',
        authMethod: 'google',
        isGuest: false,
        profileComplete: true,
        state: 'Maharashtra',
        district: 'Nashik',
        village: 'Niphad',
        landSizeAcres: 6.5,
        crops: ['Tomato', 'Grapes', 'Onion'],
        soilType: 'Deep Black Soil',
        createdAt: new Date().toISOString()
      };
      setUser(googleUser);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Google sign-in error' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    setUser(DEFAULT_GUEST_USER);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('agrisahay_auth_user');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data, profileComplete: true };
    setUser(updated);
    localStorage.setItem('agrisahay_auth_user', JSON.stringify(updated));
    localStorage.setItem(`agrisahay_user_profile_${user.id}`, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isGuest: !!user?.isGuest,
        isLoading,
        sendOtp,
        verifyOtp,
        loginWithGoogle,
        loginAsGuest,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncUser } from '../lib/apiClient';


export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  googleClientId: string;
  hasGoogleClientId: boolean;
  authMessage: string;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
  loginWithGoogle: (customName?: string, customEmail?: string, avatarUrl?: string) => void;
  loginWithGoogleCredential: (credential: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'navswar_auth_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function parseGoogleJwtToken(token: string): { name?: string; email?: string; picture?: string; sub?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google OAuth JWT token:', e);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const hasGoogleClientId = Boolean(googleClientId && googleClientId.trim() !== '');

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load user auth state:', e);
    }
  }, []);

  const openAuthModal = (message: string = '') => {
    setAuthMessage(message || 'Please sign in with your Devotee account to access full Garba lyrics and audio playback!');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthMessage('');
  };

  const loginWithGoogle = async (customName?: string, customEmail?: string, avatarUrl?: string) => {
    const name = customName || 'Devotee Singer';
    const email = customEmail || 'devotee@garbaraas.in';
    const avatar = avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    const newProfile: UserProfile = {
      id: `devotee-${Date.now()}`,
      name,
      email,
      avatarUrl: avatar,
    };

    setUser(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    closeAuthModal();

    try {
      await syncUser({ email, name, avatarUrl: avatar });
    } catch (e) {
      console.warn('Backend user sync failed, running in offline/local storage fallback:', e);
    }
  };

  const loginWithGoogleCredential = async (credential: string) => {
    const payload = parseGoogleJwtToken(credential);
    if (!payload) {
      console.error('Invalid Credential Token');
      return;
    }

    const email = payload.email || 'devotee@gmail.com';
    const name = payload.name || 'Devotee Singer';
    const avatar = payload.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    const newProfile: UserProfile = {
      id: payload.sub || `devotee-${Date.now()}`,
      name,
      email,
      avatarUrl: avatar,
    };

    setUser(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    closeAuthModal();

    try {
      await syncUser({ email, name, avatarUrl: avatar, googleId: payload.sub });
    } catch (e) {
      console.warn('Backend user sync failed:', e);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        googleClientId,
        hasGoogleClientId,
        authMessage,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithGoogleCredential,
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

import React, { createContext, useContext, useState } from 'react';

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

const DEFAULT_DEVOTEE: UserProfile = {
  id: 'devotee-public',
  name: 'Devotee Singer',
  email: 'devotee@garbaraas.in',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DevoteeSinger',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<UserProfile | null>(DEFAULT_DEVOTEE);

  const openAuthModal = () => {};
  const closeAuthModal = () => {};
  const loginWithGoogle = () => {};
  const loginWithGoogleCredential = () => {};
  const logout = () => {};

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        isAuthModalOpen: false,
        googleClientId: '',
        hasGoogleClientId: false,
        authMessage: '',
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


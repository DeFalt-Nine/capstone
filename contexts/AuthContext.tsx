
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  nickname: string | null;
  isNameMasked: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { nickname?: string; isNameMasked?: boolean }) => Promise<any>;
  getDisplayName: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState<string | null>(null);
  const [isNameMasked, setIsNameMasked] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setLoading(false);
      return;
    }

    // Check active sessions and subscribe to auth changes
    client.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setNickname(currentUser.user_metadata?.nickname || null);
        setIsNameMasked(currentUser.user_metadata?.is_name_masked || false);
      }
      setLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setNickname(currentUser.user_metadata?.nickname || null);
        setIsNameMasked(currentUser.user_metadata?.is_name_masked || false);
      } else {
        setNickname(null);
        setIsNameMasked(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    const client = supabase;
    if (!client) return;
    await client.auth.signOut();
    setUser(null);
    setNickname(null);
    setIsNameMasked(false);
  }, []);

  const updateProfile = async (updates: { nickname?: string; isNameMasked?: boolean }) => {
    const client = supabase;
    if (!client || !user) return;

    try {
      const { data, error } = await client.auth.updateUser({
        data: {
          nickname: updates.nickname !== undefined ? updates.nickname : nickname,
          is_name_masked: updates.isNameMasked !== undefined ? updates.isNameMasked : isNameMasked,
        }
      });

      if (error) throw error;
      
      if (updates.nickname !== undefined) setNickname(updates.nickname);
      if (updates.isNameMasked !== undefined) setIsNameMasked(updates.isNameMasked);
      
      return data;
    } catch (error: any) {
      console.error('[Auth] Error updating profile:', error.message);
      throw error;
    }
  };

  const getDisplayName = () => {
    const name = nickname || user?.user_metadata?.full_name || 'User';
    if (isNameMasked) {
      if (name.length <= 1) return name;
      if (name.length === 2) return name[0] + '*';
      return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
    }
    return name;
  };

  // Inactivity Timer
  useEffect(() => {
    if (!user) return;

    let timeoutId: any;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('[Auth] Inactivity timeout reached. Signing out...');
        signOut();
      }, INACTIVITY_TIMEOUT);
    };

    // Events to track activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // Initial start

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, signOut]);

  const signInWithGoogle = async () => {
    const client = supabase;
    if (!client) {
      alert('Authentication is not configured. Please check your .env file.');
      return;
    }

    // Store current path to redirect back after sign-in
    // For HashRouter, we care about the hash part
    const currentPath = window.location.hash || '#/';
    localStorage.setItem('auth_redirect_path', currentPath);

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('[Auth] Error signing in with Google:', error.message);
      throw error;
    }
  };

  // Handle redirect after sign-in
  useEffect(() => {
    const redirectPath = localStorage.getItem('auth_redirect_path');
    if (user && redirectPath) {
      localStorage.removeItem('auth_redirect_path');
      
      // Normalize paths for comparison
      const normalizedRedirect = redirectPath.startsWith('#') ? redirectPath : `#${redirectPath}`;
      const currentHash = window.location.hash || '#/';
      
      if (normalizedRedirect !== '#/' && currentHash !== normalizedRedirect) {
        window.location.hash = normalizedRedirect;
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, nickname, isNameMasked, signInWithGoogle, signOut, updateProfile, getDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

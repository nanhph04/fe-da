'use client';

import { User } from '@/shared/types/global.types';
import { api } from '@/shared/api/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  login: (user: User) => void;
  logout: () => void;
}

// Simple client-side auth state using React context-like pattern
const authState = {
  user: null as User | null,
  isLoading: true,
  isAuthenticated: false,
  listeners: new Set<() => void>(),

  setState(updates: Partial<AuthState>) {
    Object.assign(this, updates);
    this.listeners.forEach(listener => listener());
  },

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },

  async checkAuth() {
    try {
      // For demo purposes, we'll use a mock user
      // In a real app, this would call your auth API
      const mockUser: User = {
        id: '1',
        email: 'studio@example.com',
        username: 'studio-owner',
        role: 'STUDIO',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  login(user: User) {
    this.setState({
      user,
      isAuthenticated: true,
      isLoading: false
    });
  },

  logout() {
    this.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    api.post("/api/auth/logout", {}, { requireAuth: true }).catch(() => {
      api.clearToken();
    });
  }
};

export const useAuthStore = () => {
  const [, forceUpdate] = React.useState({});

  React.useEffect(() => {
    return authState.subscribe(() => forceUpdate({}));
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    checkAuth: authState.checkAuth,
    login: authState.login,
    logout: authState.logout
  };
};

// Add React import
import React from 'react';

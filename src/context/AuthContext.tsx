import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  photoUrl?: string;
  bio?: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
  twitter?: string;
  publicProfile?: boolean;
  studyLevel?: string;
  studyProgram?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage and verify token on mount
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');

      if (storedUser && accessToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);

          // Verify token is still valid by fetching current user
          const response = await userService.getMe();
          if (response.success) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        } catch (error) {
          // Token expired or invalid
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Map backend user to frontend user format
        const mappedUser: User = {
          id: user.id,
          displayName: user.displayName,
          email: user.email,
          role: user.role,
          photoUrl: user.photoUrl,
          bio: user.bio,
          skills: user.skills,
          github: user.github,
          linkedin: user.linkedin,
          twitter: user.twitter,
          publicProfile: user.publicProfile,
          studyLevel: user.studyLevel,
          studyProgram: user.studyProgram
        };

        setUser(mappedUser);
        setIsAuthenticated(true);
        
        localStorage.setItem('user', JSON.stringify(mappedUser));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
        
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.response?.data?.error || 'Invalid email or password',
        variant: 'destructive',
      });
      return false;
    }
  };

  const register = async (
    displayName: string, 
    email: string, 
    password: string,
    studyLevel?: string,
    studyProgram?: string
  ): Promise<boolean> => {
    try {
      const response = await authService.register({ 
        email, 
        password, 
        displayName,
        studyLevel,
        studyProgram
      });
      
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        
        const mappedUser: User = {
          id: user.id,
          displayName: user.displayName,
          email: user.email,
          role: user.role,
          photoUrl: user.photoUrl,
          bio: user.bio,
          skills: user.skills,
          github: user.github,
          linkedin: user.linkedin,
          twitter: user.twitter,
          publicProfile: user.publicProfile,
          studyLevel: user.studyLevel,
          studyProgram: user.studyProgram
        };

        setUser(mappedUser);
        setIsAuthenticated(true);
        
        localStorage.setItem('user', JSON.stringify(mappedUser));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        toast({
          title: 'Welcome!',
          description: 'Your account has been created successfully.',
        });
        
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.response?.data?.error || 'Failed to create account',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    }
  };

  const refreshUser = async () => {
    try {
      const response = await userService.getMe();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, logout
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await userService.updateProfile(data);
      
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: 'Update failed',
        description: error.response?.data?.error || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    const normalizedRole = role.toUpperCase();
    if (normalizedRole === 'USER') return true;
    if (normalizedRole === 'STAFF') return user.role === 'STAFF' || user.role === 'ADMIN';
    if (normalizedRole === 'ADMIN') return user.role === 'ADMIN';
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        isAuthenticated,
        hasRole,
        isLoading,
      }}
    >
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
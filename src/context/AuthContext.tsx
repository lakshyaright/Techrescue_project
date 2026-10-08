import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User;
  users: User[];
  role: UserRole;
  switchRole: (role: UserRole) => void;
  loginAs: (userId: string) => void;
  updateCurrentUser: (data: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'techrescue_auth_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('techrescue_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    return saved || 'usr-client-1'; // Default to Sonu Patel (Client)
  });

  useEffect(() => {
    localStorage.setItem('techrescue_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, currentUserId);
  }, [currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const role = currentUser.role;

  const switchRole = (newRole: UserRole) => {
    // Find matching default user for that role
    const targetUser = users.find(u => u.role === newRole);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
    }
  };

  const loginAs = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
    }
  };

  const updateCurrentUser = (data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, ...data } : u));
  };

  const logout = () => {
    setCurrentUserId('usr-client-1');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        role,
        switchRole,
        loginAs,
        updateCurrentUser,
        logout
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

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'system_admin' | 'organization_admin' | 'leader' | 'member' | 'hr_analyst';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface UserData {
  id: string;
  role: UserRole;
  status: UserStatus;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  realUserRole: UserRole | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  setImpersonatedRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  realUserRole: null,
  isLoading: true,
  signOut: async () => {},
  setImpersonatedRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [realUserData, setRealUserData] = useState<UserData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserData(session.user.id);
      else setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserData(session.user.id);
        } else {
          setRealUserData(null);
          setUserData(null);
          setImpersonatedRole(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (realUserData) {
      setUserData({
        ...realUserData,
        role: impersonatedRole || realUserData.role
      });
    }
  }, [impersonatedRole, realUserData]);

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, role, status, full_name')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        setRealUserData(data as UserData);
      }
    } catch (err) {
      console.error('Error fetching user data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSetImpersonatedRole = (role: UserRole | null) => {
    if (realUserData?.role === 'system_admin') {
      setImpersonatedRole(role);
      
      // Audit log the impersonation action asynchronously
      if (user) {
        supabase.from('audit_logs').insert({
          actor_id: user.id,
          action: role ? 'impersonation_start' : 'impersonation_stop',
          resource_type: 'role',
          new_data: { role }
        }).then();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      realUserRole: realUserData?.role ?? null,
      isLoading, 
      signOut,
      setImpersonatedRole: handleSetImpersonatedRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

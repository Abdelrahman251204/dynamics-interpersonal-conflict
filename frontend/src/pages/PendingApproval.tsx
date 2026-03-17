import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PendingApproval = () => {
  const { signOut } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ShieldAlert size={64} className="text-yellow-500 mb-6" />
      <h1 className="text-3xl font-bold mb-4">Access Pending</h1>
      <p className="text-lg text-muted mb-8 max-w-md">
        Your account has been successfully created and an access request has been sent to the system administrator. 
        You will receive access once approved.
      </p>
      <button onClick={signOut} className="btn btn-primary flex items-center gap-2">
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  );
};

export default PendingApproval;

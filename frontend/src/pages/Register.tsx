import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName } // Supabase auth meta
      }
    });
    
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess('Registration successful! Please sign in.');
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/dynamics-interpersonal-conflict/logo.png" alt="DIME Logo" style={{ height: '64px', width: 'auto', margin: '0 auto 1rem', borderRadius: '8px' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Join DIME</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Create your account
          </p>
        </div>

        {error && <div style={{ background: '#FEE2E2', color: '#EF4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        {success && <div style={{ background: '#ECFDF5', color: '#10B981', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="input-container">
            <label className="input-label">Full Name</label>
            <input 
              type="text" 
              required 
              className="input-field" 
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Dr. John Doe"
            />
          </div>
          <div className="input-container">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              required 
              className="input-field" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@organization.com"
            />
          </div>
          <div className="input-container">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              required 
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <a href="/login">Sign In</a>
        </div>
      </div>
    </div>
  );
}

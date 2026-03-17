import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) setError(signInError.message);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Shield size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>DIME System Login</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Team Dynamics & Psychological Monitoring
          </p>
        </div>

        {error && <div style={{ background: '#FEE2E2', color: '#EF4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleLogin}>
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
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account? <a href="/register">Request Access</a>
        </div>
      </div>
    </div>
  );
}

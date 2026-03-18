import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UserCheck, UserX, UserMinus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminAccessRequests() {
  const { userData } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccessRequests();
  }, []);

  const loadAccessRequests = async () => {
    try {
      const { data } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, authUserId: string, newStatus: string, currentRoleSelection: string) => {
    try {
      // Find the explicit request in state
      const targetReq = requests.find(r => r.id === requestId);
      if (!targetReq) return;
      
      const roleToSet = newStatus === 'approved' ? currentRoleSelection : undefined;

      // 1. Update access_request (reviewed_by and status)
      await supabase
        .from('access_requests')
        .update({ status: newStatus, reviewed_at: new Date().toISOString(), reviewed_by: userData?.id, requested_role: roleToSet || targetReq.requested_role })
        .eq('id', requestId);
      
      // 2. Update user profile status & role if applicable
      const updatePayload: any = { status: newStatus };
      if (roleToSet) updatePayload.role = roleToSet;
      
      await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', authUserId);

      // Refresh quietly
      loadAccessRequests();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Error updating status");
    }
  };

  if (loading) return <div>Loading access requests...</div>;

  return (
    <div className="card">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Access Requests Management</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Review, approve, reject, or suspend user access requests across the platform.</p>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Requested Role</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => {
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved';
              const isRejected = req.status === 'rejected';

              return (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{req.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      defaultValue={req.requested_role}
                      disabled={!isPending}
                      id={`role-select-\${req.id}`}
                      style={{ 
                        padding: '0.35rem 0.5rem', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border)', 
                        background: 'var(--surface)',
                        cursor: isPending ? 'pointer' : 'not-allowed',
                        opacity: isPending ? 1 : 0.7
                      }}
                    >
                      <option value="member">Member</option>
                      <option value="leader">Group Leader</option>
                      <option value="hr_analyst">HR Analyst</option>
                      <option value="organization_admin">Org Admin</option>
                      <option value="system_admin">System Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge \${isPending ? 'badge-medium' : isApproved ? 'badge-low' : 'badge-high'}`}>
                      {req.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!isApproved && (
                        <button 
                          title="Approve"
                          onClick={() => {
                            const selectElement = document.getElementById(`role-select-\${req.id}`) as HTMLSelectElement;
                            updateRequestStatus(req.id, req.auth_user_id, 'approved', selectElement.value);
                          }}
                          style={{ padding: '0.5rem', background: '#ECFDF5', color: 'var(--success)', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        >
                          <UserCheck size={18} />
                        </button>
                      )}
                      {!isRejected && (
                        <button 
                          title="Reject"
                          onClick={() => updateRequestStatus(req.id, req.auth_user_id, 'rejected', '')}
                          style={{ padding: '0.5rem', background: '#FEF2F2', color: 'var(--danger)', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        >
                          <UserX size={18} />
                        </button>
                      )}
                      {isApproved && (
                        <button 
                          title="Suspend User"
                          onClick={() => updateRequestStatus(req.id, req.auth_user_id, 'suspended', '')}
                          style={{ padding: '0.5rem', background: '#FFFBEB', color: '#D97706', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        >
                          <UserMinus size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  There are no access requests in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

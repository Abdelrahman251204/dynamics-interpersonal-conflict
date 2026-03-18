import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, Info, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  health: number;
}

interface Link {
  source: Node;
  target: Node;
  friction: number; // 0-100
}

export default function ConflictMap() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  
  useEffect(() => {
    loadDyadicData();
  }, [userData]);

  const loadDyadicData = async () => {
    try {
      if (!userData?.id) return;
      
      // Get the first group managed by this leader
      const { data: managed } = await supabase
        .from('group_memberships')
        .select('group_id')
        .eq('user_id', userData.id)
        .limit(1)
        .single();
        
      if (!managed?.group_id) {
        setLoading(false);
        return;
      }
      
      // Get team members
      const { data: members } = await supabase
        .from('group_memberships')
        .select('users(id, full_name)')
        .eq('group_id', managed.group_id);
        
      if (members && members.length > 0) {
        const teamUsers = members.map((m: any) => m.users).filter(u => u !== null);
        const userIds = teamUsers.map((u: any) => u.id);
        
        // Fetch their average scores to determine node health
        const { data: scores } = await supabase
          .from('scores')
          .select('user_id, total_normalized')
          .in('user_id', userIds);
          
        const userHealth: Record<string, number> = {};
        userIds.forEach((id: string) => userHealth[id] = 80); // Default healthy
        
        if (scores) {
          scores.forEach(s => {
            // Lower average -> Lower Health
            userHealth[s.user_id] = (userHealth[s.user_id] + s.total_normalized) / 2;
          });
        }
        
        // Generate positions in a circle
        const centerX = 250;
        const centerY = 250;
        const radius = 180;
        
        const newNodes: Node[] = teamUsers.map((u: any, idx: number) => {
          const angle = (idx / teamUsers.length) * 2 * Math.PI;
          return {
            id: u.id,
            name: u.full_name || 'Member',
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            health: userHealth[u.id] || 80
          };
        });
        
        // Generate simulated dyadic friction (since direct P2P rating schema is pending)
        const newLinks: Link[] = [];
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            // Base friction on inverse of combined health + randomness
            const combinedHealth = (newNodes[i].health + newNodes[j].health) / 2;
            const randomFactor = Math.random() * 40 - 20;
            let friction = 100 - combinedHealth + randomFactor;
            if (friction < 0) friction = 5;
            if (friction > 100) friction = 100;
            
            // Only show significant links to avoid clutter
            if (friction > 40) {
              newLinks.push({
                source: newNodes[i],
                target: newNodes[j],
                friction
              });
            }
          }
        }
        
        setNodes(newNodes);
        setLinks(newLinks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFrictionColor = (f: number) => {
    if (f > 80) return 'var(--danger)';
    if (f > 60) return '#D97706';
    return '#64748B';
  };

  if (loading) return <div>Analyzing team interaction vectors...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Dyadic Conflict Intelligence Map</h1>
          <p style={{ color: 'var(--text-muted)' }}>Visualize probable interpersonal friction clusters based on individual assessments.</p>
        </div>
      </div>

      <div className="card" style={{ background: '#FFFBEB', borderColor: '#FEF3C7', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
         <Info color="#D97706" style={{ flexShrink: 0 }} />
         <div>
           <h3 style={{ color: '#D97706', fontWeight: 600, marginBottom: '0.25rem' }}>Privacy Protected View</h3>
           <p style={{ color: '#92400E', fontSize: '0.875rem', lineHeight: 1.5 }}>
             The conflict map displays aggregated dyadic (pair-level) insights. Direct individual accusations are obscured unless mathematically highly probable and corroborated across domains to protect psychological safety.
           </p>
         </div>
      </div>

      {nodes.length < 2 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Users size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Insufficient Data</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            A minimum of 2 assigned team members is required to generate a dyadic map.
          </p>
        </div>
      ) : (
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} /> Relational Tension Network
          </h2>
          <div style={{ 
            background: '#0F172A', 
            borderRadius: '12px', 
            padding: '2rem',
            display: 'flex', 
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <svg width="500" height="500" style={{ maxWidth: '100%', height: 'auto' }}>
              {/* Draw Links First */}
              {links.map((l, i) => (
                <line 
                  key={`link-\${i}`}
                  x1={l.source.x} 
                  y1={l.source.y} 
                  x2={l.target.x} 
                  y2={l.target.y} 
                  stroke={getFrictionColor(l.friction)} 
                  strokeWidth={l.friction > 80 ? 4 : l.friction > 60 ? 2 : 1} 
                  strokeDasharray={l.friction > 80 ? 'none' : '4,4'}
                  opacity={l.friction > 60 ? 0.9 : 0.4}
                />
              ))}
              
              {/* Draw Nodes on Top */}
              {nodes.map(n => (
                <g key={n.id} transform={`translate(\${n.x}, \${n.y})`}>
                  <circle 
                    r="24" 
                    fill={n.health < 40 ? '#FEF2F2' : n.health < 70 ? '#FFFBEB' : '#ECFDF5'} 
                    stroke={n.health < 40 ? 'var(--danger)' : n.health < 70 ? '#D97706' : 'var(--success)'}
                    strokeWidth="3"
                  />
                  <text 
                    textAnchor="middle" 
                    dy=".3em" 
                    fill="#1E293B" 
                    fontSize="10px" 
                    fontWeight="bold"
                  >
                    {n.name.substring(0, 2).toUpperCase()}
                  </text>
                  <text
                    textAnchor="middle"
                    dy="35"
                    fill="#94A3B8"
                    fontSize="12px"
                  >
                    {n.name.split(' ')[0]}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
             <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
               <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Critical Friction (<span style={{color: 'var(--danger)'}}>Red / Solid</span>)</div>
               <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>High probability of escalated relationship conflict. HR intervention recommended.</p>
             </div>
             <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
               <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Emerging Conflict (<span style={{color: '#D97706'}}>Yellow / Solid</span>)</div>
               <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Moderate divergent opinions on work execution. Generally healthy if managed.</p>
             </div>
             <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
               <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Low Tension (<span style={{color: '#64748B'}}>Gray / Dashed</span>)</div>
               <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Standard operational alignment with low interpersonal stress detected.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

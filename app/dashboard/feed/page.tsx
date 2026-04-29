'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { toast } from 'sonner';
import { HelpCircle, Clock, Plus, MessageSquare, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CampusFeedPage() {
  const { profile } = useUser();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState(1);

  const fetchRequests = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('help_requests')
      .select('*, profiles(id, username)')
      .order('created_at', { ascending: false });
      
    if (data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return toast.error('Must be logged in');
    if (!title || !description) return toast.error('Please fill out all fields');
    if (credits < 1) return toast.error('Credits must be at least 1');

    const supabase = createClient();
    const { error } = await supabase.from('help_requests').insert({
      user_id: profile.id,
      title,
      description,
      credits_offered: credits
    });

    if (error) {
      toast.error('Failed to post request');
    } else {
      toast.success('Help request posted!');
      setShowForm(false);
      setTitle('');
      setDescription('');
      setCredits(1);
      fetchRequests();
    }
  };

  const handleHelp = (userId: string) => {
    if (userId === profile?.id) return;
    router.push(`/dashboard/user/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-accent-violet border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-page-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-heading">Campus Help Board</h1>
          <p className="text-[var(--text-secondary)] mt-1">Earn credits by helping peers with urgent requests.</p>
        </div>
        <GradientButton onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          {showForm ? 'Cancel' : <><Plus size={16} /> New Request</>}
        </GradientButton>
      </div>

      {showForm && (
        <GlassCard padding="lg" className="animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title</label>
              <input 
                type="text" 
                placeholder="e.g. Urgent: Need help debugging React Router"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Details</label>
              <textarea 
                placeholder="Explain what you are stuck on..."
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Bounty (Credits)</label>
              <input 
                type="number" 
                min="1"
                value={credits}
                onChange={e => setCredits(parseInt(e.target.value))}
                className="w-32 bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet transition-colors"
              />
            </div>
            <div className="flex justify-end pt-2">
              <GradientButton type="submit">Post Request</GradientButton>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle size={48} className="mx-auto text-[var(--glass-border)] mb-4" />
            <p className="text-[var(--text-muted)]">No active requests right now. Be the first to post!</p>
          </div>
        ) : (
          requests.map(req => (
            <GlassCard key={req.id} padding="lg" className="hover:border-accent-violet/30 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent-violet/10 text-accent-violet">
                      @{req.profiles?.username || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Clock size={12} /> {timeAgo(req.created_at)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 leading-tight">{req.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{req.description}</p>
                </div>
                
                <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-4 sm:min-w-[120px] sm:pl-4 sm:border-l border-[var(--glass-border)]">
                  <div className="text-center">
                    <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">Bounty</span>
                    <span className="flex items-center justify-center gap-1 text-lg font-bold text-accent-amber">
                      <Coins size={16} className="text-accent-amber" /> {req.credits_offered}
                    </span>
                  </div>
                  
                  {profile?.id !== req.user_id && (
                    <button 
                      onClick={() => handleHelp(req.user_id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-accent-matcha hover:text-white border border-[var(--glass-border)] hover:border-transparent transition-all duration-300 text-sm font-medium text-[var(--text-primary)]"
                    >
                      <MessageSquare size={14} /> Help Out
                    </button>
                  )}
                  {profile?.id === req.user_id && (
                    <span className="w-full text-center px-4 py-2 text-xs font-medium text-[var(--text-muted)] bg-[var(--glass-bg)] rounded-xl cursor-not-allowed">
                      Your Request
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}

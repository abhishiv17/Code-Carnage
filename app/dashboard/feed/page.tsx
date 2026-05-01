'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  HelpCircle,
  Clock,
  Plus,
  Coins,
  Trash2,
  Send,
  Loader2,
  TrendingUp,
  Users,
  Flame,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
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
  const [helpingId, setHelpingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
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

  /* ── Realtime updates ── */
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('feed-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'help_requests' },
        () => { fetchRequests(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return toast.error('Must be logged in');
    if (!title || !description) return toast.error('Please fill out all fields');
    if (credits < 1) return toast.error('Credits must be at least 1');

    setSubmitting(true);
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
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!profile) return;
    const supabase = createClient();
    const { error } = await supabase.from('help_requests').delete().eq('id', id).eq('user_id', profile.id);
    if (error) {
      toast.error('Failed to delete request');
    } else {
      toast.success('Request deleted');
      setRequests(reqs => reqs.filter(r => r.id !== id));
    }
  };

  const handleHelp = async (req: any) => {
    if (!profile || req.user_id === profile.id) return;
    setHelpingId(req.id);

    try {
      const supabase = createClient();
      
      // Use admin-style insert: the helper is the teacher, the requester is the learner.
      // RLS requires auth.uid() = learner_id for inserts, so we insert via the teacher
      // by also allowing teacher inserts. Instead, we'll use a direct insert with 
      // the correct role mapping. The teacher (helper) needs to be able to create sessions too.
      // 
      // Workaround: Insert the session with a status that identifies the teacher as initiator.
      // We swap the IDs so that the current user (helper) is set as teacher_id.
      // Since RLS blocks this, we use the Supabase client's RPC or a workaround.
      
      // The simplest fix: use the service-role approach via our API endpoint
      const { data: { session: authSession } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/sessions/create-from-feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authSession?.access_token ? { Authorization: `Bearer ${authSession.access_token}` } : {}),
        },
        body: JSON.stringify({
          learnerId: req.user_id,
          helpRequestId: req.id,
          helpRequestTitle: req.title,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create session');
      }

      // Send notification
      await supabase.from('notifications').insert({
        user_id: req.user_id,
        type: 'session_request',
        title: 'Someone wants to help!',
        message: `${profile.username || 'A user'} offered to help with "${req.title}".`,
        link: '/dashboard/sessions',
      });

      toast.success('Help offer sent! They will be notified.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setHelpingId(null);
    }
  };

  /* Stats */
  const totalRequests = requests.length;
  const myRequests = requests.filter(r => r.user_id === profile?.id).length;
  const totalBounty = requests.reduce((sum, r) => sum + (r.credits_offered || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 size={28} className="animate-spin text-accent-violet" />
        <p className="text-sm text-[var(--text-muted)]">Loading campus feed…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-page-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-heading flex items-center gap-2">
            Campus Help Board
            <Flame size={24} className="text-accent-coral" />
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Earn credits by helping peers with urgent requests
          </p>
        </div>
        <GradientButton onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Request</>}
        </GradientButton>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Requests', value: totalRequests, icon: HelpCircle, color: 'text-accent-violet', bg: 'bg-accent-violet/10' },
          { label: 'Total Bounty', value: `${totalBounty}c`, icon: Coins, color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
          { label: 'Your Posts', value: myRequests, icon: Users, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
        ].map((stat) => (
          <GlassCard key={stat.label} padding="sm" className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-[var(--text-primary)]">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">{stat.label}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <GlassCard gradient padding="lg" className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-violet/10 flex items-center justify-center">
              <AlertCircle size={16} className="text-accent-violet" />
            </div>
            <h3 className="text-sm font-heading font-bold text-[var(--text-primary)]">Post a Help Request</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Title</label>
              <input 
                type="text" 
                placeholder="e.g. Urgent: Need help debugging React Router"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Details</label>
              <textarea 
                placeholder="Explain what you are stuck on…"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50 transition-colors resize-none"
              />
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Bounty (Credits)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCredits(val)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
                        credits === val
                          ? 'bg-accent-amber/20 text-accent-amber border-2 border-accent-amber/30'
                          : 'bg-[var(--bg-surface-solid)] text-[var(--text-muted)] border border-[var(--glass-border)] hover:border-accent-amber/20'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                  <input 
                    type="number" 
                    min="1"
                    value={credits}
                    onChange={e => setCredits(parseInt(e.target.value) || 1)}
                    className="w-16 bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] text-center focus:outline-none focus:border-accent-violet/50 transition-colors"
                  />
                </div>
              </div>
              <GradientButton type="submit" disabled={submitting || !title || !description}>
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Posting…</> : 'Post Request'}
              </GradientButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <GlassCard padding="lg" className="text-center">
            <HelpCircle size={48} className="mx-auto text-[var(--glass-border)] mb-4" />
            <p className="text-sm font-heading font-semibold text-[var(--text-primary)] mb-1">
              No active requests right now
            </p>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Be the first to post a help request and offer credits as a bounty!
            </p>
            <GradientButton onClick={() => setShowForm(true)} size="sm">
              <Plus size={14} /> Create First Request
            </GradientButton>
          </GlassCard>
        ) : (
          requests.map(req => {
            const peerAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.profiles?.username || 'anon'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
            const isOwn = profile?.id === req.user_id;

            return (
              <GlassCard
                key={req.id}
                padding="lg"
                className="hover:border-accent-violet/20 transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    {/* Author + time */}
                    <div className="flex items-center gap-3 mb-3">
                      <Image
                        src={peerAvatar}
                        alt={req.profiles?.username || 'User'}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full bg-[var(--bg-surface-solid)]"
                      />
                      <div>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {req.profiles?.username || 'Unknown'}
                          {isOwn && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet font-medium">
                              You
                            </span>
                          )}
                        </span>
                        <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                          <Clock size={10} /> {timeAgo(req.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 leading-tight group-hover:text-accent-violet transition-colors">
                      {req.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {req.description}
                    </p>
                  </div>
                  
                  {/* Right section: Bounty + actions */}
                  <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-4 sm:min-w-[130px] sm:pl-4 sm:border-l border-[var(--glass-border)]">
                    <div className="text-center">
                      <span className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold mb-1">Bounty</span>
                      <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-amber/10 border border-accent-amber/20">
                        <Coins size={16} className="text-accent-amber" />
                        <span className="text-lg font-heading font-bold text-accent-amber">{req.credits_offered}</span>
                      </div>
                    </div>
                    
                    {!isOwn ? (
                      <button 
                        onClick={() => handleHelp(req)}
                        disabled={helpingId === req.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-emerald/10 hover:bg-accent-emerald/20 border border-accent-emerald/20 hover:border-accent-emerald/40 transition-all duration-300 text-sm font-bold text-accent-emerald disabled:opacity-50"
                      >
                        {helpingId === req.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        Help Out
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleDelete(req.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] hover:bg-accent-coral/10 hover:text-accent-coral hover:border-accent-coral/30 border border-[var(--glass-border)] transition-all duration-300 text-sm font-bold text-[var(--text-muted)]"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}

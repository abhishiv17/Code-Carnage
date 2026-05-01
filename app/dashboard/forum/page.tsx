'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/shared/GlassCard';
import { MessageCircle, Search, ThumbsUp, Eye, MessageSquare, Plus, Loader2, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: number;
  view_count: number;
  created_at: string;
  author: {
    id: string;
    username: string;
  };
  comments: { count: number }[];
  upvoted_by_me?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All Discussions' },
  { id: 'general', label: 'General' },
  { id: 'help', label: 'Q&A / Help' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'discussion', label: 'Discussion' },
];

export default function ForumPage() {
  const { user } = useUser();
  const [supabase] = useState(() => createClient());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['forum-posts', activeCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles!forum_posts_author_id_fkey(id, username),
          comments:forum_comments(count)
        `)
        .order('created_at', { ascending: false });

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // If user is logged in, check which ones they upvoted
      let upvotedIds = new Set<string>();
      if (user && data.length > 0) {
        const { data: upvotes } = await supabase
          .from('forum_upvotes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', data.map(p => p.id));
          
        if (upvotes) {
          upvotedIds = new Set(upvotes.map(u => u.post_id));
        }
      }

      return data.map(post => ({
        ...post,
        upvoted_by_me: upvotedIds.has(post.id)
      })) as ForumPost[];
    },
  });

  const handleUpvote = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the post link
    if (!user) return toast.error('You must be logged in to upvote');

    try {
      // Optimistic update locally? (Skipping for brevity, just refetching)
      const { error } = await supabase.rpc('toggle_forum_upvote', { p_post_id: postId });
      if (error) throw error;
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upvote');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-page-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-3">
            <MessageCircle className="text-accent-violet" />
            Community Forum
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Ask questions, share your projects, and discuss with the community.
          </p>
        </div>
        
        <Link 
          href="/dashboard/forum/new" 
          className="flex items-center gap-2 px-5 py-2.5 bg-accent-violet text-white rounded-xl text-sm font-semibold shadow-lg shadow-accent-violet/25 hover:shadow-accent-violet/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={18} />
          New Discussion
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                activeCategory === cat.id
                  ? 'bg-accent-violet text-white shadow-lg shadow-accent-violet/20'
                  : 'bg-[var(--bg-surface-solid)] text-[var(--text-muted)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72 md:ml-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-accent-violet" />
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--glass-border)] rounded-2xl bg-[var(--bg-surface)]">
            <MessageSquare size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
            <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-2">No discussions found</h3>
            <p className="text-sm text-[var(--text-muted)]">Be the first to start a conversation here!</p>
          </div>
        ) : (
          posts?.map(post => (
            <Link key={post.id} href={`/dashboard/forum/${post.id}`}>
              <GlassCard
                padding="md"
                className="group hover:border-accent-violet/30 transition-all hover:shadow-lg hover:shadow-accent-violet/5 flex flex-col sm:flex-row gap-4 sm:gap-6"
              >
                {/* Upvote Button (Desktop) */}
                <div className="hidden sm:flex flex-col items-center justify-start gap-1 shrink-0 pt-1">
                  <button 
                    onClick={(e) => handleUpvote(post.id, e)}
                    className={cn(
                      'p-1.5 rounded-lg transition-all',
                      post.upvoted_by_me 
                        ? 'text-accent-emerald bg-accent-emerald/10' 
                        : 'text-[var(--text-muted)] hover:text-accent-emerald hover:bg-accent-emerald/10'
                    )}
                  >
                    <ArrowUpCircle size={24} className={post.upvoted_by_me ? "fill-accent-emerald/20" : ""} />
                  </button>
                  <span className={cn(
                    'text-sm font-bold',
                    post.upvoted_by_me ? 'text-accent-emerald' : 'text-[var(--text-primary)]'
                  )}>
                    {post.upvotes}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-[var(--glass-border)] bg-[var(--bg-surface-solid)] text-[var(--text-muted)] uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      Posted by <span className="font-medium text-[var(--text-primary)]">@{post.author?.username}</span>
                    </span>
                    <span className="text-xs text-[var(--text-muted)] hidden sm:inline">•</span>
                    <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] mb-2 group-hover:text-accent-violet transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">
                    {post.content}
                  </p>

                  <div className="flex items-center flex-wrap gap-2">
                    {post.tags?.map(tag => (
                      <span key={tag} className="text-xs font-medium px-2 py-1 rounded bg-[var(--bg-surface)] text-[var(--text-muted)]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats (Mobile Upvote + Views/Comments) */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0 sm:w-24 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--glass-border)]">
                  {/* Mobile Upvote */}
                  <div className="flex sm:hidden items-center gap-1.5">
                    <button 
                      onClick={(e) => handleUpvote(post.id, e)}
                      className={cn(
                        'p-1 rounded transition-all',
                        post.upvoted_by_me ? 'text-accent-emerald' : 'text-[var(--text-muted)]'
                      )}
                    >
                      <ArrowUpCircle size={20} className={post.upvoted_by_me ? "fill-accent-emerald/20" : ""} />
                    </button>
                    <span className={cn('text-sm font-bold', post.upvoted_by_me ? 'text-accent-emerald' : '')}>
                      {post.upvotes}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]" title="Comments">
                    <MessageSquare size={16} />
                    <span className="text-sm font-medium">{post.comments?.[0]?.count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]" title="Views">
                    <Eye size={16} />
                    <span className="text-sm font-medium">{post.view_count}</span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

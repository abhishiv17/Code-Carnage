'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/shared/GlassCard';
import { 
  Library, 
  Search, 
  Plus, 
  Video, 
  FileText, 
  Book, 
  ExternalLink, 
  ThumbsUp, 
  Loader2, 
  Globe,
  MoreVertical,
  ChevronDown,
  Edit2,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { SKILL_CATEGORIES } from '@/lib/constants';

interface Resource {
  id: string;
  uploader_id: string;
  title: string;
  description: string;
  url: string;
  resource_type: 'video' | 'article' | 'book' | 'course' | 'other';
  category: string;
  tags: string[];
  upvotes: number;
  created_at: string;
  uploader: {
    username: string;
  };
  upvoted_by_me?: boolean;
}

const RESOURCE_TYPES = [
  { id: 'all', label: 'All Types', icon: Globe },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'article', label: 'Articles', icon: FileText },
  { id: 'book', label: 'Books/E-books', icon: Book },
  { id: 'course', label: 'Courses', icon: ExternalLink },
];

export default function ResourceLibraryPage() {
  const { user } = useUser();
  const [supabase] = useState(() => createClient());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Form state for new resource
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    url: '',
    resource_type: 'article',
    category: 'programming',
    tags: '',
  });

  const { data: resources, isLoading, refetch } = useQuery({
    queryKey: ['resources', activeType, activeCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('resources')
        .select(`
          *,
          uploader:profiles(username)
        `)
        .order('upvotes', { ascending: false });

      if (activeType !== 'all') query = query.eq('resource_type', activeType);
      if (activeCategory !== 'all') query = query.eq('category', activeCategory);
      if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);

      const { data, error } = await query;
      if (error) throw error;

      let upvotedIds = new Set<string>();
      if (user) {
        const { data: upvotes } = await supabase
          .from('resource_upvotes')
          .select('resource_id')
          .eq('user_id', user.id);
        if (upvotes) upvotedIds = new Set(upvotes.map(u => u.resource_id));
      }

      return data.map(r => ({
        ...r,
        upvoted_by_me: upvotedIds.has(r.id)
      })) as Resource[];
    },
  });

  const handleUpvote = async (resourceId: string) => {
    if (!user) return toast.error('Please login to upvote');
    try {
      await supabase.rpc('toggle_resource_upvote', { p_resource_id: resourceId });
      refetch();
    } catch (err) {
      toast.error('Failed to upvote');
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to share resources');
    
    try {
      const { error } = await supabase.from('resources').insert({
        uploader_id: user.id,
        ...newResource,
        tags: newResource.tags.split(',').map(t => t.trim()).filter(Boolean),
      });

      if (error) throw error;
      
      toast.success('Resource shared successfully!');
      setIsAddModalOpen(false);
      setNewResource({
        title: '',
        description: '',
        url: '',
        resource_type: 'article',
        category: 'programming',
        tags: '',
      });
      refetch();
    } catch (err) {
      toast.error('Failed to share resource');
    }
  };

  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingResource) return;

    try {
      const { error } = await supabase
        .from('resources')
        .update({
          title: editingResource.title,
          description: editingResource.description,
          url: editingResource.url,
          resource_type: editingResource.resource_type,
          category: editingResource.category,
          tags: Array.isArray(editingResource.tags) 
            ? editingResource.tags 
            : (editingResource.tags as string).split(',').map(t => t.trim()).filter(Boolean),
        })
        .eq('id', editingResource.id)
        .eq('uploader_id', user.id);

      if (error) throw error;

      toast.success('Resource updated successfully!');
      setEditingResource(null);
      refetch();
    } catch (err) {
      toast.error('Failed to update resource');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;
      toast.success('Resource deleted');
      refetch();
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={16} className="text-accent-coral" />;
      case 'article': return <FileText size={16} className="text-accent-violet" />;
      case 'book': return <Book size={16} className="text-accent-amber" />;
      case 'course': return <ExternalLink size={16} className="text-accent-emerald" />;
      default: return <Globe size={16} className="text-accent-violet" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-page-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-3">
            <Library className="text-accent-violet" />
            Resource Library
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Explore curated learning materials shared by the community.
          </p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent-violet text-white rounded-xl text-sm font-semibold shadow-lg shadow-accent-violet/25 hover:shadow-accent-violet/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={18} />
          Share Resource
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {RESOURCE_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border",
                activeType === type.id
                  ? "bg-accent-violet/10 border-accent-violet/30 text-accent-violet"
                  : "bg-[var(--bg-surface-solid)] border-[var(--glass-border)] text-[var(--text-muted)] hover:bg-[var(--glass-bg)]"
              )}
            >
              <type.icon size={14} />
              {type.label}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="appearance-none pl-4 pr-10 py-3 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors cursor-pointer min-w-[160px]"
          >
            <option value="all">All Categories</option>
            {SKILL_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>
      </div>

      {/* Resource Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent-violet" />
        </div>
      ) : resources?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[var(--glass-border)] rounded-2xl bg-[var(--bg-surface)]">
          <Library size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
          <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-2">No resources found</h3>
          <p className="text-sm text-[var(--text-muted)]">Try adjusting your filters or be the first to share one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources?.map(resource => (
            <GlassCard 
              key={resource.id} 
              padding="lg" 
              className="group hover:border-accent-violet/30 transition-all hover:-translate-y-1 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-[var(--bg-surface-solid)] border border-[var(--glass-border)]">
                  {getTypeIcon(resource.resource_type)}
                </div>
                <div className="flex items-center gap-2">
                  {user?.id === resource.uploader_id && (
                    <div className="flex items-center gap-1 mr-2">
                      <button 
                        onClick={() => setEditingResource(resource)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-accent-violet hover:bg-accent-violet/10 transition-colors"
                        title="Edit Resource"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteResource(resource.id)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-accent-coral hover:bg-accent-coral/10 transition-colors"
                        title="Delete Resource"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={() => handleUpvote(resource.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                      resource.upvoted_by_me
                        ? "bg-accent-violet text-white border-accent-violet shadow-lg shadow-accent-violet/20"
                        : "bg-[var(--bg-surface-solid)] border-[var(--glass-border)] text-[var(--text-muted)] hover:text-accent-violet hover:border-accent-violet/30"
                    )}
                  >
                    <ThumbsUp size={14} className={resource.upvoted_by_me ? "fill-white" : ""} />
                    {resource.upvotes}
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-violet/10 text-accent-violet border border-accent-violet/20 uppercase tracking-wider">
                    {resource.category}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                    by @{resource.uploader.username}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-[var(--text-primary)] mb-2 group-hover:text-accent-violet transition-colors line-clamp-1">
                  {resource.title}
                </h3>
                
                <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">
                  {resource.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {resource.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-surface-solid)] text-[var(--text-muted)] border border-[var(--glass-border)]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-accent-violet shadow-lg shadow-accent-violet/20 hover:shadow-accent-violet/40 transition-all"
              >
                Open Resource
                <ExternalLink size={14} />
              </a>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <GlassCard padding="lg" className="w-full max-w-lg shadow-2xl border-accent-violet/30 animate-scale-in">
            <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Plus size={24} className="text-accent-violet" />
              Share a Learning Resource
            </h2>
            
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master React in 10 Minutes"
                  value={newResource.title}
                  onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Type</label>
                  <select
                    value={newResource.resource_type}
                    onChange={(e) => setNewResource({...newResource, resource_type: e.target.value as any})}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors cursor-pointer"
                  >
                    {RESOURCE_TYPES.filter(t => t.id !== 'all').map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors cursor-pointer"
                  >
                    {SKILL_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Resource URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/resource"
                  value={newResource.url}
                  onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="What is this resource about? Why is it helpful?"
                  value={newResource.description}
                  onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. react, hooks, frontend"
                  value={newResource.tags}
                  onChange={(e) => setNewResource({...newResource, tags: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-accent-violet text-white rounded-xl text-sm font-semibold shadow-lg shadow-accent-violet/25 hover:shadow-accent-violet/40 transition-all"
                >
                  Share Resource
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
      {/* Edit Resource Modal */}
      {editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <GlassCard padding="lg" className="w-full max-w-lg shadow-2xl border-accent-violet/30 animate-scale-in">
            <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Edit2 size={24} className="text-accent-violet" />
              Edit Resource
            </h2>
            
            <form onSubmit={handleUpdateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master React in 10 Minutes"
                  value={editingResource.title}
                  onChange={(e) => setEditingResource({...editingResource, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Type</label>
                  <select
                    value={editingResource.resource_type}
                    onChange={(e) => setEditingResource({...editingResource, resource_type: e.target.value as any})}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors cursor-pointer"
                  >
                    {RESOURCE_TYPES.filter(t => t.id !== 'all').map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={editingResource.category}
                    onChange={(e) => setEditingResource({...editingResource, category: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors cursor-pointer"
                  >
                    {SKILL_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Resource URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/resource"
                  value={editingResource.url}
                  onChange={(e) => setEditingResource({...editingResource, url: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  placeholder="What is this resource about? Why is it helpful?"
                  value={editingResource.description}
                  onChange={(e) => setEditingResource({...editingResource, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. react, hooks, frontend"
                  value={Array.isArray(editingResource.tags) ? editingResource.tags.join(', ') : editingResource.tags}
                  onChange={(e) => setEditingResource({...editingResource, tags: e.target.value as any})}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-accent-violet text-white rounded-xl text-sm font-semibold shadow-lg shadow-accent-violet/25 hover:shadow-accent-violet/40 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { Loader2, Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface PeerProfile {
  id: string;
  username: string;
}

interface Conversation {
  peer: PeerProfile;
  lastMessage: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const selectedPeerId = searchParams.get('peerId');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPeerId]); // and also on new messages, handled below

  const { data, isLoading } = useQuery({
    queryKey: ['messages', user?.id],
    enabled: !!user,
    queryFn: async () => {
      // 1. Fetch all messages for user
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order('created_at', { ascending: true });

      if (error) {
        // If table doesn't exist yet, just return empty to prevent crash
        if (error.code === '42P01') return { messages: [], profiles: {}, conversations: [] };
        throw error;
      }

      const msgs = (messages || []) as Message[];
      
      // 2. Find all unique peer IDs
      const peerIds = Array.from(new Set(
        msgs.flatMap(m => [m.sender_id, m.receiver_id]).filter(id => id !== user!.id)
      ));
      
      // If we came here from a 'Message' button with a peerId that we don't have history with yet
      if (selectedPeerId && !peerIds.includes(selectedPeerId)) {
        peerIds.push(selectedPeerId);
      }

      let profileMap: Record<string, PeerProfile> = {};
      if (peerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', peerIds);
          
        profiles?.forEach(p => {
          profileMap[p.id] = p;
        });
      }

      // 3. Group by conversations
      const convosMap: Record<string, Message[]> = {};
      peerIds.forEach(id => { convosMap[id] = []; });
      
      msgs.forEach(m => {
        const peerId = m.sender_id === user!.id ? m.receiver_id : m.sender_id;
        if (!convosMap[peerId]) convosMap[peerId] = [];
        convosMap[peerId].push(m);
      });

      const conversations: Conversation[] = peerIds.map(peerId => {
        const cMsgs = convosMap[peerId] || [];
        const unreadCount = cMsgs.filter(m => m.receiver_id === user!.id && !m.is_read).length;
        const lastMessage = cMsgs.length > 0 ? cMsgs[cMsgs.length - 1] : null;
        
        return {
          peer: profileMap[peerId] || { id: peerId, username: 'Unknown' },
          lastMessage: lastMessage as Message, // might be null if new
          unreadCount
        };
      }).sort((a, b) => {
        if (!a.lastMessage) return -1;
        if (!b.lastMessage) return 1;
        return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
      });

      return { messages: msgs, profiles: profileMap, conversations };
    },
    staleTime: 60 * 1000,
  });

  const allMessages = data?.messages || [];
  const conversations = data?.conversations || [];
  const profiles = data?.profiles || {};

  // Get active conversation messages
  const activeMessages = allMessages.filter(
    m => (m.sender_id === user?.id && m.receiver_id === selectedPeerId) || 
         (m.receiver_id === user?.id && m.sender_id === selectedPeerId)
  );

  const activePeer = selectedPeerId ? profiles[selectedPeerId] : null;

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const realtimeSupabase = createClient();
    
    const channel = realtimeSupabase
      .channel('messages_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            
            // Auto-scroll if it's the active chat
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      realtimeSupabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (!user || !selectedPeerId) return;
    
    const markRead = async () => {
      const unreadCount = activeMessages.filter(m => m.receiver_id === user.id && !m.is_read).length;
      if (unreadCount > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('receiver_id', user.id)
          .eq('sender_id', selectedPeerId)
          .eq('is_read', false);
          
        queryClient.invalidateQueries({ queryKey: ['messages'] });
      }
    };
    
    markRead();
  }, [selectedPeerId, activeMessages, user, supabase, queryClient]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPeerId || !user) return;
    
    setSending(true);
    const content = newMessage.trim();
    setNewMessage(''); // optimistic clear
    
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: selectedPeerId,
        content: content
      });
      
    if (error) {
      toast.error('Failed to send message');
      setNewMessage(content); // restore on fail
    } else {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
    
    setSending(false);
  };

  const getAvatarUrl = (name: string) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-accent-violet" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Sidebar: Conversations List */}
      <GlassCard className={cn(
        "flex-col h-full overflow-hidden md:w-80 lg:w-96 shrink-0",
        selectedPeerId ? "hidden md:flex" : "flex"
      )} padding="none">
        <div className="p-4 border-b border-[var(--glass-border)]">
          <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No conversations yet.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {conversations.map((convo) => {
                const isActive = convo.peer.id === selectedPeerId;
                return (
                  <button
                    key={convo.peer.id}
                    onClick={() => router.push(`/dashboard/messages?peerId=${convo.peer.id}`)}
                    className={cn(
                      "flex items-center gap-3 p-4 border-b border-[var(--glass-border)] text-left transition-colors hover:bg-[var(--glass-bg)]",
                      isActive && "bg-[var(--glass-bg)] border-l-4 border-l-accent-violet"
                    )}
                  >
                    <Image
                      src={getAvatarUrl(convo.peer.username)}
                      alt={convo.peer.username}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full bg-[var(--bg-surface-solid)] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                          {convo.peer.username}
                        </span>
                        {convo.lastMessage && (
                          <span className="text-[10px] text-[var(--text-muted)] shrink-0 ml-2">
                            {new Date(convo.lastMessage.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs truncate",
                        convo.unreadCount > 0 ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-muted)]"
                      )}>
                        {convo.lastMessage ? convo.lastMessage.content : 'Start chatting...'}
                      </p>
                    </div>
                    {convo.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-accent-violet text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {convo.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Main Chat Area */}
      <GlassCard className={cn(
        "flex-1 flex-col h-full overflow-hidden",
        !selectedPeerId ? "hidden md:flex" : "flex"
      )} padding="none">
        {!selectedPeerId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] p-8 text-center">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-heading font-semibold text-[var(--text-primary)] mb-1">Your Messages</p>
            <p className="text-sm max-w-sm">Select a conversation from the sidebar or start a new chat with a peer.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[var(--glass-border)] flex items-center gap-3 bg-[var(--glass-bg)]">
              <button 
                onClick={() => router.push('/dashboard/messages')}
                className="md:hidden p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft size={20} />
              </button>
              <Image
                src={getAvatarUrl(activePeer?.username || 'User')}
                alt={activePeer?.username || 'Peer'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full bg-[var(--bg-surface-solid)]"
              />
              <div>
                <h3 className="font-heading font-semibold text-[var(--text-primary)]">
                  {activePeer?.username || 'Loading...'}
                </h3>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeMessages.length === 0 ? (
                <div className="text-center py-10 text-[var(--text-muted)] text-sm">
                  This is the beginning of your conversation with {activePeer?.username}.
                </div>
              ) : (
                activeMessages.map((msg, i) => {
                  const isMe = msg.sender_id === user?.id;
                  const showDate = i === 0 || new Date(msg.created_at).toDateString() !== new Date(activeMessages[i - 1].created_at).toDateString();
                  
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center mb-4 mt-2">
                          <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold px-2 py-1 bg-[var(--bg-surface-solid)] rounded-full">
                            {new Date(msg.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <div className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2 text-sm relative group",
                          isMe 
                            ? "bg-accent-violet text-white rounded-br-none" 
                            : "bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] rounded-bl-none"
                        )}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <span className={cn(
                            "text-[9px] mt-1 block opacity-60 text-right",
                            isMe ? "text-white/80" : "text-[var(--text-muted)]"
                          )}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-[var(--glass-bg)] border-t border-[var(--glass-border)]">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50 transition-colors"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-accent-violet text-white hover:bg-accent-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}

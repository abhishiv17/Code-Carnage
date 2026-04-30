'use client';

import { useState, useRef, useEffect } from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, Send, Paperclip, Mic, Image as ImageIcon, FileText, UserPlus, Check, X, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';

export default function MessagesPage() {
  const { profile } = useUser();
  const [selectedChat, setSelectedChat] = useState<string | null>('1');
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
  const [inputText, setInputText] = useState('');
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- Voice Recording Logic ---
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Voice recording requires a secure connection (HTTPS or localhost). Please use localhost:3000 to test this feature.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleFileUpload(audioBlob, `voice_memo_${Date.now()}.webm`, 'audio');
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      toast.error('Microphone access denied or not available. Error: ' + err.message);
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // --- File Upload Logic ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const type = file.type.startsWith('image/') ? 'image' : 'pdf';
    await handleFileUpload(file, file.name, type);
  };

  const handleFileUpload = async (file: File | Blob, fileName: string, fileType: string) => {
    if (!profile) return toast.error('You must be logged in.');
    
    setIsUploading(true);
    const supabase = createClient();
    const filePath = `${profile.id}/${Date.now()}_${fileName}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('message_attachments')
        .getPublicUrl(filePath);

      // We don't append to mock UI anymore, we insert into the real DB
      const otherUserId = activeChats.find(c => c.id === selectedChat)?.requester_id === profile.id 
        ? activeChats.find(c => c.id === selectedChat)?.receiver_id 
        : activeChats.find(c => c.id === selectedChat)?.requester_id;

      if (otherUserId) {
        await supabase.from('messages').insert({
          sender_id: profile.id,
          receiver_id: otherUserId,
          attachment_url: publicUrlData.publicUrl,
          attachment_name: fileName,
          attachment_type: fileType,
        });
      }
      
      toast.success('Attachment sent!');
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Real Data States
  const [connections, setConnections] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  const pendingRequests = connections.filter(c => c.receiver_id === profile?.id && c.status === 'pending');
  const activeChats = connections.filter(c => c.status === 'accepted');

  // Refs for realtime listeners to access current state without triggering re-renders
  const selectedChatRef = useRef(selectedChat);
  const connectionsRef = useRef(connections);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    connectionsRef.current = connections;
  }, [selectedChat, connections]);

  useEffect(() => {
    async function loadConnections() {
      if (!profile?.id) return;
      const supabase = createClient();
      
      // Fetch connections and join with profiles table
      const { data } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          requester_id,
          receiver_id,
          created_at,
          requester:profiles!connections_requester_id_fkey(id, username, full_name, college_name),
          receiver:profiles!connections_receiver_id_fkey(id, username, full_name, college_name)
        `)
        .or(`requester_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('updated_at', { ascending: false });

      if (data) setConnections(data);
      setLoadingChats(false);
    }
    loadConnections();
  }, [profile?.id]);

  // Presence and Realtime Messages
  useEffect(() => {
    if (!profile?.id) return;
    const supabase = createClient();
    
    // Subscribe to Presence
    const room = supabase.channel('online_users');
    room.on('presence', { event: 'sync' }, () => {
      const newState = room.presenceState();
      const online = new Set<string>();
      Object.values(newState).forEach((presenceArray: any) => {
        presenceArray.forEach((p: any) => online.add(p.user_id));
      });
      setOnlineUsers(online);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await room.track({ user_id: profile.id, online_at: new Date().toISOString() });
      }
    });

    // Subscribe to new messages globally
    const realtimeSub = supabase.channel('messages_and_connections')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new;
        if (newMessage.sender_id === profile.id || newMessage.receiver_id === profile.id) {
           const currentSelectedChat = selectedChatRef.current;
           const currentConnections = connectionsRef.current;
           
           const chat = currentConnections.find((c: any) => c.id === currentSelectedChat);
           const otherUserId = chat?.requester_id === profile.id ? chat?.receiver_id : chat?.requester_id;

           // Only append to chatMessages if it belongs to the active chat
           if (
             (newMessage.sender_id === profile.id && newMessage.receiver_id === otherUserId) ||
             (newMessage.sender_id === otherUserId && newMessage.receiver_id === profile.id)
           ) {
               setChatMessages(prev => {
                 if (prev.find(m => m.id === newMessage.id)) return prev;
                 return [...prev, newMessage];
               });
               
               if (newMessage.receiver_id === profile.id) {
                  supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', newMessage.id).then();
               }
           }
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
         setChatMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connections' }, async (payload) => {
         const newConn = payload.new;
         if (newConn.requester_id === profile.id || newConn.receiver_id === profile.id) {
            const { data } = await supabase
              .from('connections')
              .select(`
                id, status, requester_id, receiver_id, created_at,
                requester:profiles!connections_requester_id_fkey(id, username, full_name, college_name),
                receiver:profiles!connections_receiver_id_fkey(id, username, full_name, college_name)
              `)
              .eq('id', newConn.id)
              .single();
              
            if (data) {
                setConnections(prev => {
                   if (prev.find(c => c.id === data.id)) return prev;
                   return [data, ...prev];
                });
            }
         }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'connections' }, (payload) => {
         const updatedConn = payload.new;
         if (updatedConn.requester_id === profile.id || updatedConn.receiver_id === profile.id) {
             setConnections(prev => prev.map(c => c.id === updatedConn.id ? { ...c, status: updatedConn.status } : c));
         }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'connections' }, (payload) => {
         const deletedConn = payload.old;
         setConnections(prev => prev.filter(c => c.id !== deletedConn.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(room);
      supabase.removeChannel(realtimeSub);
    };
  }, [profile?.id]);

  // Fetch messages for selected chat
  useEffect(() => {
    async function loadMessages() {
      if (!selectedChat || !profile?.id) return;
      const chat = activeChats.find(c => c.id === selectedChat);
      if (!chat) return;
      const otherUserId = chat.requester_id === profile.id ? chat.receiver_id : chat.requester_id;
      
      const supabase = createClient();
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });
        
      if (data) {
        setChatMessages(data);
        // Mark unread messages from them as read
        const unreadIds = data.filter(m => m.receiver_id === profile.id && !m.is_read).map(m => m.id);
        if (unreadIds.length > 0) {
           await supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() }).in('id', unreadIds);
        }
      }
    }
    loadMessages();
  }, [selectedChat, profile?.id, connections]);

  const handleAcceptRequest = async (connectionId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('connections').update({ status: 'accepted' }).eq('id', connectionId);
    if (!error) {
      setConnections(prev => prev.map(c => c.id === connectionId ? { ...c, status: 'accepted' } : c));
      
      const req = pendingRequests.find(r => r.id === connectionId);
      if (req && req.requester_id) {
         await supabase.from('notifications').insert({
            user_id: req.requester_id,
            type: 'connection_accepted',
            title: 'Connection Accepted',
            message: `${profile?.full_name || profile?.username || 'Someone'} accepted your connection request!`,
            link: `/dashboard/messages`
         });
      }
      
      toast.success('Request accepted! You can now message each other.');
    } else toast.error('Failed to accept request.');
  };

  const handleDeclineRequest = async (connectionId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('connections').delete().eq('id', connectionId);
    if (!error) {
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      toast.info('Request declined.');
    } else toast.error('Failed to decline request.');
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !profile?.id || !selectedChat) return;
    const chat = activeChats.find(c => c.id === selectedChat);
    if (!chat) return;
    const otherUserId = chat.requester_id === profile.id ? chat.receiver_id : chat.requester_id;

    const supabase = createClient();
    const { error } = await supabase.from('messages').insert({
      sender_id: profile.id,
      receiver_id: otherUserId,
      content: inputText
    });
    
    if (error) toast.error('Failed to send message');
    else setInputText('');
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-page-in">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">Direct Messages</h1>
        <p className="text-sm text-[var(--text-muted)]">Connect and share resources with your peers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[650px]">
        {/* Left Sidebar: Chat List */}
        <GlassCard padding="none" className="md:col-span-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--bg-surface-solid)]">
            <div className="flex bg-[var(--glass-bg)] p-1 rounded-xl border border-[var(--glass-border)]">
              <button 
                onClick={() => setActiveTab('messages')}
                className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-all ${activeTab === 'messages' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              >
                Messages
              </button>
              <button 
                onClick={() => setActiveTab('requests')}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg transition-all ${activeTab === 'requests' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              >
                Requests {pendingRequests.length > 0 && <span className="bg-accent-coral text-white text-[9px] px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loadingChats ? (
              <div className="p-4 text-center text-[var(--text-muted)] text-sm">Loading...</div>
            ) : activeTab === 'messages' ? (
              activeChats.length > 0 ? activeChats.map((chat) => {
                const otherUser = chat.requester_id === profile?.id ? chat.receiver : chat.requester;
                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full flex items-start gap-3 p-4 border-b border-[var(--glass-border)] transition-colors text-left relative ${
                      selectedChat === chat.id ? 'bg-accent-violet/10' : 'hover:bg-[var(--glass-bg)]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Image 
                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${otherUser?.username || 'user'}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                        alt="Avatar" width={40} height={40} className="rounded-full bg-[var(--bg-surface-solid)]" 
                      />
                      {onlineUsers.has(otherUser?.id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-medium text-sm text-[var(--text-primary)] truncate">{otherUser?.full_name || otherUser?.username}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] truncate">Connected!</p>
                    </div>
                  </button>
                );
              }) : <div className="p-4 text-center text-[var(--text-muted)] text-sm">No active chats</div>
            ) : (
              pendingRequests.length > 0 ? pendingRequests.map((req) => (
                <div key={req.id} className="p-4 border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <Image 
                      src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${req.requester?.username || 'user'}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                      alt="Avatar" width={40} height={40} className="rounded-full bg-[var(--bg-surface-solid)] shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-medium text-sm text-[var(--text-primary)] truncate">{req.requester?.full_name || req.requester?.username}</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mb-1">{req.requester?.college_name}</p>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">Wants to connect with you.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAcceptRequest(req.id)} className="flex-1 bg-accent-violet text-white text-xs font-medium py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                      Accept
                    </button>
                    <button onClick={() => handleDeclineRequest(req.id)} className="flex-1 bg-[var(--bg-surface)] border border-[var(--glass-border)] text-[var(--text-primary)] text-xs font-medium py-1.5 rounded-lg hover:bg-[var(--glass-bg)] transition-colors">
                      Decline
                    </button>
                  </div>
                </div>
              )) : <div className="p-4 text-center text-[var(--text-muted)] text-sm">No pending requests</div>
            )}
          </div>
        </GlassCard>

        {/* Chat Area */}
        <GlassCard padding="none" className="md:col-span-2 flex flex-col overflow-hidden bg-[var(--bg-surface)] relative">
          {activeTab === 'messages' && selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--bg-surface-solid)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const chat = activeChats.find(c => c.id === selectedChat);
                    const otherUser = chat?.requester_id === profile?.id ? chat?.receiver : chat?.requester;
                    return (
                      <>
                        <div className="relative">
                          <Image src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${otherUser?.username || 'user'}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt="Avatar" width={36} height={36} className="rounded-full bg-[var(--bg-surface-solid)]" />
                          {onlineUsers.has(otherUser?.id) && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-[var(--text-primary)]">{otherUser?.full_name || otherUser?.username}</h3>
                          <span className="text-[10px] text-emerald-500 font-medium">
                            {onlineUsers.has(otherUser?.id) ? 'Online' : 'Connected'}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-5">
                {chatMessages.map((msg) => {
                  const isMe = msg.sender_id === profile?.id;
                  const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={msg.id} className={cn("flex flex-col max-w-[80%]", isMe ? "self-end items-end" : "self-start items-start")}>
                      <div className={cn(
                        "px-4 py-2.5 rounded-2xl shadow-sm relative group",
                        isMe 
                          ? "bg-accent-violet text-white rounded-br-sm" 
                          : "bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] rounded-bl-sm"
                      )}>
                        {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                        
                        {msg.attachment_url && (
                          <div className="mt-2">
                            {msg.attachment_type === 'image' && (
                              <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                                <Image src={msg.attachment_url} alt="Attached image" width={200} height={150} className="rounded-lg object-cover border border-white/20" />
                              </a>
                            )}
                            {msg.attachment_type === 'audio' && (
                              <audio controls className="h-10 max-w-[200px] mt-1">
                                <source src={msg.attachment_url} type="audio/webm" />
                              </audio>
                            )}
                            {msg.attachment_type !== 'image' && msg.attachment_type !== 'audio' && (
                              <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/10 hover:bg-black/20 px-3 py-2 rounded-lg transition-colors text-sm">
                                <FileText size={16} /> {msg.attachment_name || 'Document'}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-[var(--text-muted)] px-1">
                        <span>{timeStr}</span>
                        {isMe && (
                          <span className={msg.is_read ? "text-accent-matcha" : ""}>
                            <Check size={12} className={msg.is_read ? "opacity-100" : "opacity-60"} />
                            {msg.is_read && <span className="ml-1">Read</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Advanced Message Input */}
              <div className="p-4 border-t border-[var(--glass-border)] bg-[var(--bg-surface-solid)]">
                {isUploading && (
                  <div className="flex items-center gap-2 text-xs text-accent-violet mb-2 animate-pulse">
                    <Loader2 size={12} className="animate-spin" /> Uploading attachment...
                  </div>
                )}
                
                <div className="flex items-end gap-2 bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-2xl p-2 focus-within:border-accent-violet/40 focus-within:ring-1 focus-within:ring-accent-violet/20 transition-all">
                  
                  {/* Attachments Menu */}
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx" />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRecording || isUploading}
                    className="p-2 text-[var(--text-muted)] hover:text-accent-violet transition-colors rounded-xl hover:bg-accent-violet/10 disabled:opacity-50"
                  >
                    <Paperclip size={18} />
                  </button>

                  {isRecording ? (
                    <div className="flex-1 flex items-center gap-3 py-2 px-3 text-accent-coral animate-pulse">
                      <Mic size={16} /> 
                      <span className="text-sm font-medium">Recording: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}</span>
                    </div>
                  ) : (
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      placeholder="Type a message..." 
                      rows={1}
                      disabled={isUploading}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none py-2 max-h-32 min-h-[40px] disabled:opacity-50"
                    />
                  )}

                  {/* Actions (Mic & Send) */}
                  <div className="flex items-center gap-1">
                    {isRecording ? (
                      <button 
                        onClick={stopRecording}
                        className="p-2.5 rounded-xl bg-accent-coral text-white hover:opacity-90 transition-all mb-0.5 shadow-lg shadow-accent-coral/20"
                        title="Stop & Send Voice Memo"
                      >
                        <div className="w-3 h-3 bg-white rounded-sm" />
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={startRecording}
                        disabled={isUploading || inputText.trim().length > 0}
                        className={cn(
                          "p-2.5 rounded-xl transition-all mb-0.5",
                          inputText.trim() ? "text-[var(--text-muted)] opacity-30 cursor-not-allowed" : "text-[var(--text-muted)] hover:text-accent-violet hover:bg-accent-violet/10 disabled:opacity-50"
                        )}
                        title="Record Voice Memo"
                      >
                        <Mic size={18} />
                      </button>
                    )}

                    <button 
                      onClick={handleSendMessage}
                      disabled={isUploading || (!inputText.trim() && !isRecording)}
                      className="p-2.5 bg-gradient-to-tr from-accent-violet to-accent-amber text-white rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-accent-violet/20 mb-0.5 disabled:opacity-50 disabled:grayscale"
                      title="Send Message"
                    >
                      <Send size={16} className="ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)]">
              <div className="w-16 h-16 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center mb-4">
                <MessageSquare size={24} className="opacity-50" />
              </div>
              <p className="font-medium text-[var(--text-primary)]">Your Messages</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

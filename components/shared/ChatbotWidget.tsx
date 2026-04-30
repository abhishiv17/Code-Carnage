'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, X, Send, User, Sparkles, Loader2, ChevronDown, Mic, Paperclip, FileText, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authFetch } from '@/lib/authFetch';

import { createClient } from '@/lib/supabase/client';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
};

const SUGGESTIONS = [
  '🎯 Find me a match for React',
  '🧠 Quiz me on Python',
  '💡 How do credits work?',
  '📚 Prep me for a session',
];

function MarkdownMessage({ content }: { content: string }) {
// ... rest of MarkdownMessage ...
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => <span className="font-semibold text-[var(--text-primary)]">{children}</span>,
        em: ({ children }) => <span className="italic text-[var(--text-secondary)]">{children}</span>,
        ul: ({ children }) => <ul className="mt-1 mb-2 space-y-1 pl-1">{children}</ul>,
        ol: ({ children }) => <ol className="mt-1 mb-2 space-y-1 pl-1 list-decimal list-inside">{children}</ol>,
        li: ({ children }) => <li className="flex items-start gap-2 text-[var(--text-secondary)]"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-violet/60 shrink-0" /><span>{children}</span></li>,
        h1: ({ children }) => <h1 className="font-heading font-bold text-sm text-[var(--text-primary)] mb-1 mt-2">{children}</h1>,
        h2: ({ children }) => <h2 className="font-heading font-semibold text-sm text-[var(--text-primary)] mb-1 mt-2 border-b border-[var(--glass-border)] pb-0.5">{children}</h2>,
        h3: ({ children }) => <h3 className="font-heading font-semibold text-xs text-accent-violet uppercase tracking-wider mb-1 mt-2">{children}</h3>,
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-');
          return isBlock ? <code className="block bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-xs font-mono text-accent-amber overflow-x-auto my-2 whitespace-pre">{children}</code> : <code className="bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded px-1.5 py-0.5 text-xs font-mono text-accent-amber">{children}</code>;
        },
        blockquote: ({ children }) => <blockquote className="border-l-2 border-accent-violet/40 pl-3 my-2 text-[var(--text-muted)] italic text-xs">{children}</blockquote>,
        hr: () => <hr className="border-[var(--glass-border)] my-2" />,
        a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-violet underline underline-offset-2 hover:opacity-80 transition-opacity">{children}</a>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1 px-1">
      {[0, 150, 300].map((delay) => (
        <span key={delay} className="w-1.5 h-1.5 bg-accent-violet/50 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </div>
  );
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your **SkillSwap AI**. I can:\n- 🎯 Find you the perfect skill match\n- 🧠 Quiz you on your skills\n- 📚 Prep you before a session\n\nWhat can I help with?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{name: string, content: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    async function loadHistory() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('ai_chat_history').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
      if (data && data.length > 0) {
        const history: Message[] = data.map(d => ({ role: d.role, content: d.content, image: d.image_url }));
        setMessages(prev => [...prev, ...history]);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = 'en-IN';
      rec.continuous = true;
      rec.interimResults = true;
      rec.onstart = () => setIsListening(true);
      rec.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setInput((prev) => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      setRecognition(rec);
    }
  }, []);

  const handleMicClick = () => {
    if (!recognition) return;
    isListening ? recognition.stop() : recognition.start();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => setAttachedImage(event.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      try {
        const text = await file.text();
        setAttachedFile({ name: file.name, content: text.slice(0, 10000) });
      } catch (err) {
        alert("Failed to parse file text.");
      }
    }
  };

  useEffect(() => {
    if (isOpen) setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [messages, isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() && !attachedImage && !attachedFile) return;

    let finalMessage = text.trim();
    if (attachedFile) {
      finalMessage = `[Attached File: ${attachedFile.name}]\n${attachedFile.content}\n\nUser Question: ${finalMessage || 'Please analyze this document.'}`;
    }

    setInput('');
    const currentImage = attachedImage;
    setAttachedImage(null);
    setAttachedFile(null);
    if (isListening && recognition) recognition.stop();

    const newMessages: Message[] = [...messages, { role: 'user', content: finalMessage, image: currentImage || undefined }];
    setMessages(newMessages);
    setIsTyping(true);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await authFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: newMessages.map((m) => ({ role: m.role, content: m.content, image: m.image })) }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
        });
      }
    } catch {
      setMessages((prev) => [...prev.slice(0, -1), { role: 'assistant', content: '❌ Something went wrong. Please try again!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <div className={cn('mb-4 transition-all duration-300 origin-bottom-right', isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-4 pointer-events-none')}>
        <div className={cn("flex flex-col glass rounded-3xl shadow-2xl border border-accent-violet/15 overflow-hidden", isFullScreen ? "fixed inset-4 w-auto h-auto z-[60]" : "w-[360px] sm:w-[420px] h-[560px] max-h-[80vh]")}>
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-accent-violet/10 to-accent-amber/5 border-b border-[var(--glass-border)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-accent-violet to-accent-amber flex items-center justify-center shadow-lg">
                <Sparkles size={16} className="text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--bg-surface)]" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-[var(--text-primary)] leading-tight">SkillSwap AI</p>
                <p className="text-[10px] text-accent-violet font-medium">Your personal study assistant</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-solid)]"><Maximize2 size={16}/></button>
              <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-solid)] transition-all"><ChevronDown size={18} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn('flex gap-2.5 max-w-[90%]', msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
                <div className={cn('shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5', msg.role === 'user' ? 'bg-[var(--bg-surface-solid)] border border-[var(--glass-border)]' : 'bg-gradient-to-tr from-accent-violet to-accent-amber shadow-sm')}>
                  {msg.role === 'user' ? <User size={13} className="text-[var(--text-muted)]" /> : <Bot size={13} className="text-white" />}
                </div>
                <div className={cn('rounded-2xl text-sm leading-relaxed px-4 py-3', msg.role === 'user' ? 'bg-gradient-to-br from-accent-violet/15 to-accent-violet/5 border border-accent-violet/20 text-[var(--text-primary)] rounded-tr-sm' : 'bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-secondary)] rounded-tl-sm')}>
                  {msg.role === 'assistant' && msg.content === '' && isTyping ? <TypingIndicator /> : <MarkdownMessage content={msg.content} />}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-[var(--glass-border)] bg-[var(--bg-surface)] shrink-0">
            {attachedImage && (
              <div className="mb-2 relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--glass-border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={attachedImage} alt="Attached" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setAttachedImage(null)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white"><X size={12} /></button>
              </div>
            )}
            {attachedFile && (
              <div className="mb-2 p-2 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-surface-solid)] flex items-center justify-between w-fit max-w-[200px]">
                <div className="flex items-center gap-2 overflow-hidden"><FileText size={16} className="text-accent-violet shrink-0" /><span className="text-xs font-medium text-[var(--text-primary)] truncate">{attachedFile.name}</span></div>
                <button type="button" onClick={() => setAttachedFile(null)} className="ml-2"><X size={14} /></button>
              </div>
            )}
            <div className="flex items-center gap-2 bg-[var(--bg-surface-solid)] rounded-2xl border border-[var(--glass-border)] px-4 py-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[var(--text-muted)] hover:text-accent-violet"><Paperclip size={16} /></button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." disabled={isTyping} className="flex-1 bg-transparent text-sm focus:outline-none" />
              <button type="button" onClick={handleMicClick} className={cn("p-1", isListening && "text-accent-coral animate-pulse")}><Mic size={16} /></button>
              <button type="submit" disabled={(!input.trim() && !attachedImage && !attachedFile) || isTyping} className={cn('w-8 h-8 rounded-xl flex items-center justify-center', (input.trim() || attachedImage || attachedFile) && !isTyping ? 'bg-gradient-to-tr from-accent-violet to-accent-amber text-white' : 'bg-[var(--glass-border)]')}>
                {isTyping ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">Powered by Groq · Llama 3.1</p>
          </form>
        </div>
      </div>

      {/* ── FAB Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95',
          isOpen
            ? 'bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-muted)]'
            : 'bg-gradient-to-tr from-accent-violet to-accent-amber text-white shadow-accent-violet/30'
        )}
      >
        <div className={cn('transition-all duration-300', isOpen ? 'rotate-0' : 'rotate-0')}>
          {isOpen ? <X size={22} /> : <Bot size={26} />}
        </div>
        {/* Notification pulse when closed */}
        {!isOpen && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[var(--bg-base)] animate-pulse" />
        )}
      </button>
    </div>
  );
}

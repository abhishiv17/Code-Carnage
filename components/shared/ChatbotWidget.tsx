'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, X, Send, User, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authFetch } from '@/lib/authFetch';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const SUGGESTIONS = [
  '🎯 Find me a match for React',
  '💡 How do credits work?',
  '📚 Prep me for a Python session',
];

function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>
        ),
        // Bold
        strong: ({ children }) => (
          <span className="font-semibold text-[var(--text-primary)]">{children}</span>
        ),
        // Italic
        em: ({ children }) => (
          <span className="italic text-[var(--text-secondary)]">{children}</span>
        ),
        // Unordered list
        ul: ({ children }) => (
          <ul className="mt-1 mb-2 space-y-1 pl-1">{children}</ul>
        ),
        // Ordered list
        ol: ({ children }) => (
          <ol className="mt-1 mb-2 space-y-1 pl-1 list-decimal list-inside">{children}</ol>
        ),
        // List item
        li: ({ children }) => (
          <li className="flex items-start gap-2 text-[var(--text-secondary)]">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-violet/60 shrink-0" />
            <span>{children}</span>
          </li>
        ),
        // Headings
        h1: ({ children }) => (
          <h1 className="font-heading font-bold text-sm text-[var(--text-primary)] mb-1 mt-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-heading font-semibold text-sm text-[var(--text-primary)] mb-1 mt-2 border-b border-[var(--glass-border)] pb-0.5">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-heading font-semibold text-xs text-accent-violet uppercase tracking-wider mb-1 mt-2">{children}</h3>
        ),
        // Inline code
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-');
          return isBlock ? (
            <code className="block bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-xs font-mono text-accent-amber overflow-x-auto my-2 whitespace-pre">
              {children}
            </code>
          ) : (
            <code className="bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded px-1.5 py-0.5 text-xs font-mono text-accent-amber">
              {children}
            </code>
          );
        },
        // Block quote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent-violet/40 pl-3 my-2 text-[var(--text-muted)] italic text-xs">
            {children}
          </blockquote>
        ),
        // Horizontal rule
        hr: () => <hr className="border-[var(--glass-border)] my-2" />,
        // Links
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-violet underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {children}
          </a>
        ),
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
        <span
          key={delay}
          className="w-1.5 h-1.5 bg-accent-violet/50 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your **SkillSwap AI**. I can:\n- 🎯 Find you the perfect skill match\n- 📚 Prep you before a session\n- 💡 Answer platform questions\n\nWhat can I help with?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage = text.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await authFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      if (!res.body) throw new Error('No stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last.role !== 'assistant') return prev;
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: '❌ Something went wrong. Please try again!' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <div
        className={cn(
          'mb-4 transition-all duration-300 origin-bottom-right',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        )}
      >
        <div className="w-[360px] sm:w-[420px] flex flex-col glass rounded-3xl shadow-2xl border border-accent-violet/15 overflow-hidden"
          style={{ height: '560px', maxHeight: '80vh' }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-accent-violet/10 to-accent-amber/5 border-b border-[var(--glass-border)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-accent-violet to-accent-amber flex items-center justify-center shadow-lg shadow-accent-violet/20">
                <Sparkles size={16} className="text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--bg-surface)]" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-[var(--text-primary)] leading-tight">SkillSwap AI</p>
                <p className="text-[10px] text-accent-violet font-medium">Your personal study assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-solid)] transition-all"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex gap-2.5 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5',
                    msg.role === 'user'
                      ? 'bg-[var(--bg-surface-solid)] border border-[var(--glass-border)]'
                      : 'bg-gradient-to-tr from-accent-violet to-accent-amber shadow-sm'
                  )}
                >
                  {msg.role === 'user'
                    ? <User size={13} className="text-[var(--text-muted)]" />
                    : <Bot size={13} className="text-white" />
                  }
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    'rounded-2xl text-sm leading-relaxed px-4 py-3',
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-accent-violet/15 to-accent-violet/5 border border-accent-violet/20 text-[var(--text-primary)] rounded-tr-sm'
                      : 'bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-secondary)] rounded-tl-sm'
                  )}
                >
                  {msg.role === 'assistant' && msg.content === '' && isTyping && idx === messages.length - 1 ? (
                    <TypingIndicator />
                  ) : msg.role === 'assistant' ? (
                    <MarkdownMessage content={msg.content} />
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Suggestions (show only when last message is from assistant and no typing) ── */}
          {messages.length <= 1 && !isTyping && (
            <div className="px-4 pb-3 flex flex-wrap gap-2 shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-accent-violet/20 bg-accent-violet/5 text-accent-violet hover:bg-accent-violet/10 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* ── Input ── */}
          <form
            onSubmit={handleSubmit}
            className="px-4 py-3 border-t border-[var(--glass-border)] bg-[var(--bg-surface)] shrink-0"
          >
            <div className="flex items-center gap-2 bg-[var(--bg-surface-solid)] rounded-2xl border border-[var(--glass-border)] px-4 py-2 focus-within:border-accent-violet/40 focus-within:ring-1 focus-within:ring-accent-violet/20 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isTyping}
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0',
                  input.trim() && !isTyping
                    ? 'bg-gradient-to-tr from-accent-violet to-accent-amber text-white shadow-md shadow-accent-violet/20 hover:opacity-90 hover:scale-105'
                    : 'bg-[var(--glass-border)] text-[var(--text-muted)] cursor-not-allowed'
                )}
              >
                {isTyping
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Send size={13} className="ml-0.5 mt-0.5" />
                }
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">
              Powered by Groq · Llama 3.1
            </p>
          </form>
        </div>
      </div>

      {/* ── FAB Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95',
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

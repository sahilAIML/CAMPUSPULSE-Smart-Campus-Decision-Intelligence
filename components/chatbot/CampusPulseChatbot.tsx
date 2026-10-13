'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  Key,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  Check,
  HelpCircle,
  ShieldCheck,
  GraduationCap,
  Users,
  Building,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
}

const QUICK_PROMPTS = [
  { label: '🔐 How to Log In', prompt: 'What are the step-by-step instructions and credentials to log into the portals?' },
  { label: '🎓 Student: Boost Score', prompt: 'What are the steps for a student to check and improve their Success Score?' },
  { label: '👩‍🏫 Faculty: Exam Lifecycle', prompt: 'What are the step-by-step instructions for faculty to start/stop exams and appoint marks?' },
  { label: '🏛️ Admin: CSV Import & Commit', prompt: 'How does an admin upload, preview, and commit new student CSV records?' },
  { label: '🔑 Authorized Credentials', prompt: 'What are the authorized test credentials and login process?' },
  { label: '⚖️ Score Weight Tuning', prompt: 'What is the procedure for administrators to calibrate institutional score weights?' },
];

export default function CampusPulseChatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [keySavedToast, setKeySavedToast] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `👋 **Welcome to CampusPulse!**

I am **PulseBot**, your institutional process assistant. I provide **detailed step-by-step instructions and guides** for every feature and workflow across our platform.

📌 **What I can guide you through:**
• 🔐 **Login & Role Access**: Step-by-step instructions to authenticate to Student, Faculty, or Admin portals using verified credentials.
• 🎓 **Student Success Score**: How to check your 7-indicator score breakdown, follow sensitivity improvement roadmaps, and take timed examinations.
• 👩‍🏫 **Faculty Tools**: How to monitor cohort benchmarks, start & stop exams, review submission turnouts, and appoint leaderboard marks.
• 🏛️ **Admin Governance**: Step-by-step process to upload and commit student CSV datasets, tune indicator weights, and audit institutional logs.
• 💼 **Placements & Announcements**: How to explore recruitment metrics and circulars.

*(Security Notice: For campus security, direct portal links are restricted. All users must authenticate through the official [Sign In](/login) portal.)*

Click any topic below or ask for instructions on any website process!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'institutional-engine',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved API key from localStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('campuspulse_gemini_api_key');
      if (savedKey) {
        setApiKey(savedKey);
        setTempApiKey(savedKey);
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !showSettings) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, showSettings]);

  const saveApiKey = () => {
    const trimmed = tempApiKey.trim();
    setApiKey(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem('campuspulse_gemini_api_key', trimmed);
      } else {
        localStorage.removeItem('campuspulse_gemini_api_key');
      }
    } catch {
      // Ignore
    }
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setShowSettings(false);
    }, 1200);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const apiPayload = {
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        apiKey: apiKey || undefined,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I'm here to provide instructions for any process across CampusPulse. Please ask your question!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: data.provider || 'institutional-engine',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        role: 'assistant',
        content: `### 🔐 Campus Access Process
To access any protected portal (Student, Faculty, or Admin), follow these official steps:

1. Click to open [Sign In](/login).
2. Select your designated role tab (Student, Faculty, or Admin).
3. Enter your verified institutional email and password (\`Password@123\`).
4. Click **Sign In** to open your personal dashboard.

Ask me for any process or step-by-step instructions across the platform!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'fallback',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const navigateTo = (path: string) => {
    // SECURITY POLICY: Do not allow direct bypass to protected portals. Route to login instead.
    if (
      path === '/admin' ||
      path === '/faculty' ||
      path === '/student' ||
      path.startsWith('/admin') ||
      path.startsWith('/faculty') ||
      path.startsWith('/student')
    ) {
      router.push('/login');
      return;
    }

    if (path.startsWith('/#')) {
      const hash = path.replace('/', '');
      if (window.location.pathname === '/') {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push(path);
      }
    } else {
      router.push(path);
    }
  };

  // Helper to render message content with interactive navigation buttons for markdown links
  const renderFormattedMessage = (content: string) => {
    // Look for markdown links: [Title](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: Array<{ type: 'text' | 'link'; text: string; url?: string }> = [];

    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          text: content.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'link',
        text: match[1],
        url: match[2],
      });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        text: content.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-2 text-sm leading-relaxed text-clay-text select-text">
        {parts.map((part, index) => {
          if (part.type === 'link' && part.url) {
            // Guard against direct dashboard links in buttons
            const isProtected =
              part.url === '/admin' ||
              part.url === '/faculty' ||
              part.url === '/student' ||
              part.url.startsWith('/admin') ||
              part.url.startsWith('/faculty') ||
              part.url.startsWith('/student');

            const targetUrl = isProtected ? '/login' : part.url;
            const buttonText = isProtected ? `Login to Access (${part.text})` : part.text;
            const isInternal = targetUrl.startsWith('/') || targetUrl.startsWith('#');

            return (
              <button
                key={index}
                onClick={() => (isInternal ? navigateTo(targetUrl) : window.open(targetUrl, '_blank'))}
                className="inline-flex items-center gap-1.5 px-3 py-1 my-1 mr-1.5 text-xs font-semibold text-teal-dark dark:text-teal bg-teal/10 hover:bg-teal/20 border border-teal/30 rounded-full transition-all duration-200 transform hover:scale-[1.03] active:scale-95 shadow-sm"
              >
                <span>{buttonText}</span>
                {isInternal ? <ArrowRight className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
              </button>
            );
          }

          // Format normal text with line breaks, bolding, and code snippets
          const lines = part.text.split('\n');
          return (
            <span key={index}>
              {lines.map((line, lIdx) => {
                // Check if heading
                const isHeading = line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ');
                const cleanLine = line.replace(/^#{1,4}\s*/, '');

                // Simple bold replacer
                const boldRegex = /\*\*([^*]+)\*\*/g;
                const boldParts = [];
                let bLast = 0;
                let bMatch;
                while ((bMatch = boldRegex.exec(cleanLine)) !== null) {
                  if (bMatch.index > bLast) {
                    boldParts.push(cleanLine.substring(bLast, bMatch.index));
                  }
                  boldParts.push(
                    <strong key={bMatch.index} className="font-bold text-coral-dark dark:text-coral-light">
                      {bMatch[1]}
                    </strong>
                  );
                  bLast = bMatch.index + bMatch[0].length;
                }
                if (bLast < cleanLine.length) {
                  boldParts.push(cleanLine.substring(bLast));
                }

                return (
                  <React.Fragment key={lIdx}>
                    {isHeading ? (
                      <span className="block font-bold text-base mt-2 mb-1 text-clay-text">
                        {boldParts.length ? boldParts : cleanLine}
                      </span>
                    ) : (
                      <span>{boldParts.length ? boldParts : cleanLine}</span>
                    )}
                    {lIdx < lines.length - 1 && <br />}
                  </React.Fragment>
                );
              })}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 mr-3 px-3.5 py-2 rounded-full bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-card)] animate-pulse-subtle">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal"></span>
            </span>
            <span className="text-xs font-semibold text-clay-text tracking-wide">
              Need help? Ask PulseBot
            </span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Campus AI Chatbot' : 'Open Campus AI Chatbot'}
          className={`relative group flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 transform active:scale-95 ${
            isOpen
              ? 'bg-clay-pressed shadow-[var(--shadow-clay-card-pressed)] text-clay-muted'
              : 'bg-gradient-to-tr from-teal via-teal-dark to-coral text-white shadow-[var(--shadow-clay-btn)] hover:shadow-[var(--shadow-clay-btn-hover)] hover:scale-105'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <>
              <Bot className="w-7 h-7 transition-transform duration-200 group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-coral text-[9px] font-black items-center justify-center text-white">
                  ✦
                </span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="CampusPulse AI Assistant"
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] md:w-[450px] h-[600px] max-h-[82vh] flex flex-col bg-[var(--clay-card)] border border-[var(--clay-border)] rounded-3xl shadow-[var(--shadow-clay-card)] overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--clay-border)] bg-[var(--clay-card)] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal to-coral flex items-center justify-center text-white shadow-[var(--shadow-clay-badge)]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight text-clay-text">PulseBot AI</h3>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal/15 text-teal-dark dark:text-teal tracking-wider uppercase border border-teal/20">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-clay-muted">Institutional Process & Steps Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="Configure Google Gemini API Key"
                className={`p-2 rounded-xl transition-all duration-200 ${
                  showSettings || apiKey
                    ? 'bg-sun/15 text-sun-dark dark:text-sun shadow-inner'
                    : 'text-clay-muted hover:text-clay-text hover:bg-clay-pressed'
                }`}
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-2 rounded-xl text-clay-muted hover:text-clay-text hover:bg-clay-pressed transition-all duration-200"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Optional Gemini API Key Drawer */}
          {showSettings && (
            <div className="p-4 bg-[var(--clay-pressed)] border-b border-[var(--clay-border)] space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-sun-dark dark:text-sun" />
                  <span className="text-xs font-bold text-clay-text">Google Gemini API Key</span>
                </div>
                <span className="text-[10px] text-teal-dark font-medium">Supported</span>
              </div>
              <p className="text-[11px] text-clay-muted leading-relaxed">
                Connect your personal Google Gemini API Key (e.g. from Google AI Studio) for advanced natural conversational inference. If you don't enter one, PulseBot uses the built-in zero-downtime campus process knowledge engine!
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Paste Gemini API Key: AIzaSy..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-input)] focus:outline-none focus:ring-1 focus:ring-teal text-clay-text"
                />
                <button
                  onClick={saveApiKey}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal text-white hover:bg-teal-dark shadow-[var(--shadow-clay-btn)] transition-all flex items-center gap-1.5"
                >
                  {keySavedToast ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
              {apiKey && (
                <div className="flex items-center justify-between text-[11px] text-teal-dark dark:text-teal">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Custom Gemini Key Active
                  </span>
                  <button
                    onClick={() => {
                      setTempApiKey('');
                      setApiKey('');
                      localStorage.removeItem('campuspulse_gemini_api_key');
                    }}
                    className="text-coral hover:underline"
                  >
                    Clear Key
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 border-b border-[var(--clay-border)]/60 bg-[var(--clay-bg)]/50 overflow-x-auto no-scrollbar flex items-center gap-2 whitespace-nowrap">
            <Compass className="w-3.5 h-3.5 text-teal shrink-0 ml-1" />
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-clay-text bg-[var(--clay-card)] border border-[var(--clay-border)] hover:border-teal/50 hover:bg-teal/5 rounded-full shadow-[var(--shadow-clay-pill)] transition-all duration-150 active:scale-95 disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-transparent to-black/5 dark:to-black/20">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal to-coral flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-[var(--shadow-clay-card)] border ${
                      isBot
                        ? 'bg-[var(--clay-card)] border-[var(--clay-border)] text-clay-text'
                        : 'bg-gradient-to-r from-coral to-coral-dark text-white border-coral-light/20 shadow-[var(--shadow-clay-coral)]'
                    }`}
                  >
                    {isBot ? (
                      renderFormattedMessage(msg.content)
                    ) : (
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}

                    <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-[var(--clay-border)]/20 text-[10px] opacity-70">
                      <span>{msg.timestamp}</span>
                      {isBot && msg.provider && (
                        <span className="font-mono text-[9px] uppercase tracking-wider">
                          {msg.provider === 'gemini' ? 'Gemini 1.5' : 'Pulse Knowledge'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2.5 text-clay-muted">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal to-coral flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-teal animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-teal animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs font-medium ml-1">PulseBot is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3.5 border-t border-[var(--clay-border)] bg-[var(--clay-card)]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask for instructions on any process, login steps, exams, scores..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-[var(--clay-card)] border border-[var(--clay-border)] shadow-[var(--shadow-clay-input)] focus:outline-none focus:ring-2 focus:ring-teal/60 text-clay-text placeholder:text-clay-muted/70 disabled:opacity-60 transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send message"
                className="p-2.5 rounded-2xl bg-gradient-to-r from-teal to-coral text-white shadow-[var(--shadow-clay-btn)] hover:shadow-[var(--shadow-clay-btn-hover)] hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none transition-all duration-200 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-clay-muted">
              <span>Press Enter to send</span>
              <span className="font-semibold text-teal-dark dark:text-teal">Font: Oxanium Variable</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

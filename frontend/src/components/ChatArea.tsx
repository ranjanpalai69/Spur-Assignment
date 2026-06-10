import { useEffect, useRef } from 'react';
import {
  faCircleExclamation,
  faXmark,
  faBars,
  faEllipsis,
  faSun,
  faMoon,
} from '@fortawesome/free-solid-svg-icons';
import { Fa } from './ui/Fa';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import InputBar from './InputBar';
import WelcomeScreen from './WelcomeScreen';
import type { Message } from '../types';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onClearError: () => void;
  onMenuClick: () => void;
  onThemeToggle: () => void;
  isDark: boolean;
}

function HistorySkeleton() {
  return (
    <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
      {[false, true, false, false, true].map((isUser, i) => (
        <div key={i} className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
          {!isUser && <div className="w-8 h-8 rounded-full skeleton shrink-0" />}
          <div
            className="skeleton rounded-2xl"
            style={{ height: i % 2 === 0 ? '52px' : '36px', width: isUser ? '45%' : '60%' }}
          />
        </div>
      ))}
    </div>
  );
}

export default function ChatArea({
  messages,
  isLoading,
  isLoadingHistory,
  error,
  onSend,
  onClearError,
  onMenuClick,
  onThemeToggle,
  isDark,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0">
      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-slate-900
                         border-b border-slate-100 dark:border-slate-800 shrink-0 z-10
                         shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400
                     hover:text-slate-700 dark:hover:text-slate-200
                     hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Fa icon={faBars} size={18} />
        </button>

        {/* Agent avatar */}
        <div className="relative shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-full
                          text-white text-sm font-bold shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)' }}>
            SE
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full
                           bg-emerald-400 border-2 border-white dark:border-slate-900" />
        </div>

        {/* Agent info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
            ShopEase Support
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Online · Replies instantly
            </p>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-xl text-slate-400 dark:text-slate-500
                     hover:text-slate-700 dark:hover:text-slate-200
                     hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Fa icon={isDark ? faSun : faMoon} size={15} />
        </button>

        {/* More */}
        <button
          className="p-2 rounded-xl text-slate-400 dark:text-slate-500
                     hover:text-slate-600 dark:hover:text-slate-300
                     hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="More options"
        >
          <Fa icon={faEllipsis} size={16} />
        </button>
      </header>

      {/* ── Error banner ── */}
      {error && (
        <div className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-xl shrink-0 animate-slide-up
                        bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50">
          <Fa icon={faCircleExclamation} size={15} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400 flex-1">{error}</p>
          <button onClick={onClearError}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors p-0.5">
            <Fa icon={faXmark} size={14} />
          </button>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto scrollbar-chat min-h-0 chat-bg">
        {isLoadingHistory ? (
          <HistorySkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col h-full">
            <WelcomeScreen onQuickQuestion={onSend} />
          </div>
        ) : (
          <div className="px-4 py-5 space-y-4 max-w-3xl mx-auto w-full">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} className="h-1" />
          </div>
        )}
        {messages.length === 0 && <div ref={bottomRef} />}
      </div>

      <InputBar onSend={onSend} isLoading={isLoading} />
    </div>
  );
}

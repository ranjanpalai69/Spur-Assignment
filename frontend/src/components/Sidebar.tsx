import { useEffect, useState, useCallback } from 'react';
import {
  faRobot,
  faPlus,
  faXmark,
  faWandMagicSparkles,
  faClock,
  faMagnifyingGlass,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons';
import { Fa } from './ui/Fa';
import { api } from '../services/api';
import type { Conversation } from '../types';

interface SidebarProps {
  currentSessionId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
  refreshTrigger: number;
  isDark: boolean;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByDate(convs: Conversation[]): [string, Conversation[]][] {
  const now = new Date();
  const groups = new Map<string, Conversation[]>();
  const ORDER = ['Today', 'Yesterday', 'This week', 'Older'];

  for (const c of convs) {
    const d = new Date(c.updatedAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
    let label: string;
    if (diffDays === 0) label = 'Today';
    else if (diffDays === 1) label = 'Yesterday';
    else if (diffDays < 7) label = 'This week';
    else label = 'Older';
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(c);
  }

  return ORDER.filter(k => groups.has(k)).map(k => [k, groups.get(k)!]);
}

export default function Sidebar({
  currentSessionId,
  onSelectConversation,
  onNewChat,
  onClose,
  refreshTrigger,
  isDark,
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.getConversations();
      setConversations(data.conversations);
    } catch {
      // sidebar degrades gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, refreshTrigger]);

  const filtered = search.trim()
    ? conversations.filter(c =>
        (c.title ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : conversations;

  const grouped = groupByDate(filtered);

  // Scrollbar class: dark gets white-tinted thumb, light gets slate thumb
  const scrollbarClass = isDark ? 'scrollbar-sidebar-dark' : 'scrollbar-sidebar-light';

  return (
    <aside className="flex flex-col h-full w-72 shrink-0 select-none
                      bg-white dark:bg-[#0f0e17]
                      border-r border-slate-200 dark:border-white/[0.05]">

      {/* ── Brand ── */}
      <div className="px-4 pt-5 pb-4 border-b border-slate-100 dark:border-white/[0.05]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="relative flex items-center justify-center w-9 h-9 rounded-xl shrink-0 text-white"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              }}
            >
              <Fa icon={faRobot} size={16} className="text-white" />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400"
                style={{ border: isDark ? '2px solid #0f0e17' : '2px solid #ffffff' }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none tracking-tight">
                ShopEase
              </p>
              <p className="text-[10px] mt-0.5 font-medium tracking-wide text-indigo-500 dark:text-indigo-400">
                Support Chat
              </p>
            </div>
          </div>

          {/* Close — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg transition-colors
                       text-slate-400 hover:text-slate-600 hover:bg-slate-100
                       dark:text-white/30 dark:hover:text-white/70 dark:hover:bg-white/5"
            aria-label="Close sidebar"
          >
            <Fa icon={faXmark} size={16} />
          </button>
        </div>

        {/* New chat */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
                     text-white text-sm font-medium transition-all duration-200 active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: '0 4px 14px rgba(99,102,241,0.28)',
          }}
        >
          <Fa icon={faPlus} size={13} />
          <span>New Conversation</span>
          <Fa icon={faWandMagicSparkles} size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </button>
      </div>

      {/* ── Search ── */}
      <div className="px-3 py-3 border-b border-slate-100 dark:border-white/[0.04]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg
                        bg-slate-100 border border-slate-200
                        dark:bg-white/5 dark:border-white/[0.06]">
          <Fa icon={faMagnifyingGlass} size={12}
            className="text-slate-400 dark:text-white/25 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 bg-transparent text-xs focus:outline-none
                       text-slate-700 dark:text-white/65
                       placeholder:text-slate-400 dark:placeholder:text-white/25"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60">
              <Fa icon={faXmark} size={11} />
            </button>
          )}
        </div>
      </div>

      {/* ── Conversation list ── */}
      <nav className={`flex-1 overflow-y-auto py-1 ${scrollbarClass}`}>
        {loading ? (
          <div className="px-3 space-y-1 pt-2">
            {[72, 55, 68, 80, 48].map((w, i) => (
              <div key={i} className="flex items-center gap-2.5 px-2 py-2.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0
                                 bg-slate-200 dark:bg-white/[0.07]" />
                <span className="h-2 rounded-full bg-slate-200 dark:bg-white/[0.07]"
                  style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 mt-12
                          text-slate-300 dark:text-white/20">
            <Fa icon={faCommentDots} size={22} />
            <p className="text-xs">{search ? 'No results found' : 'No conversations yet'}</p>
          </div>
        ) : (
          grouped.map(([label, items]) => (
            <div key={label}>
              <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
                <Fa icon={faClock} size={9}
                  className="text-slate-300 dark:text-white/[0.16]" />
                <span className="text-[9px] font-bold uppercase tracking-widest
                                 text-slate-400 dark:text-white/[0.16]">
                  {label}
                </span>
              </div>
              {items.map(conv => {
                const isActive = currentSessionId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={[
                      'group flex items-center gap-2.5 py-2.5 px-3 rounded-xl',
                      'transition-all duration-150 text-left',
                      isActive
                        ? 'bg-indigo-50 border border-indigo-200/70 dark:bg-indigo-500/[0.14] dark:border-indigo-500/20'
                        : 'border border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.04]',
                    ].join(' ')}
                    style={{ width: 'calc(100% - 16px)', margin: '1px 8px' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        background: isActive
                          ? '#6366f1'
                          : isDark ? 'rgba(255,255,255,0.16)' : '#cbd5e1',
                      }}
                    />
                    <span
                      className="flex-1 text-xs truncate"
                      style={{
                        color: isActive
                          ? isDark ? '#a5b4fc' : '#4f46e5'
                          : isDark ? 'rgba(255,255,255,0.42)' : '#64748b',
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      {conv.title ?? 'New Conversation'}
                    </span>
                    <span className="shrink-0 text-[10px] tabular-nums
                                     text-slate-400 dark:text-white/20">
                      {timeAgo(conv.updatedAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </nav>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0
                          text-white text-[8px] font-bold"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            AI
          </div>
          <p className="text-[10px] text-slate-400 dark:text-white/25">
            GPT-4o mini · Encrypted
          </p>
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

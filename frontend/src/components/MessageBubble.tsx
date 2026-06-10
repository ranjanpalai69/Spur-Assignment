import { useState } from 'react';
import type { ReactNode } from 'react';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Fa } from './ui/Fa';
import type { Message } from '../types';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function renderText(text: string): ReactNode {
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (!listItems.length) return;
    elements.push(
      <ul key={key} className="space-y-1 my-1.5 ml-0.5">
        {listItems.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      listItems.push(trimmed.slice(2));
    } else {
      flushList(`list-${idx}`);
      if (trimmed) {
        elements.push(<p key={idx} className="leading-relaxed">{renderInline(trimmed)}</p>);
      } else if (elements.length > 0) {
        elements.push(<div key={idx} className="h-1" />);
      }
    }
  });
  flushList('list-end');

  return <>{elements}</>;
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
  return parts.map((part, i) => {
    if (
      (part.startsWith('**') && part.endsWith('**')) ||
      (part.startsWith('__') && part.endsWith('__'))
    ) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end items-end gap-2 animate-msg-in group">
        <div className="flex flex-col items-end gap-1.5 max-w-[78%] sm:max-w-[70%]">
          <div
            className="text-white px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.32)',
            }}
          >
            <div className="space-y-1">{renderText(message.text)}</div>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 px-1
                           opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 animate-msg-in group">
      {/* Avatar */}
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full
                   text-white text-[11px] font-bold shrink-0"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
          boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
        }}
      >
        SE
      </div>

      <div className="flex flex-col gap-1.5 max-w-[78%] sm:max-w-[70%]">
        <div
          className="relative bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100
                     px-4 py-3 rounded-2xl rounded-bl-md text-sm
                     border border-slate-100 dark:border-slate-700/50"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="space-y-1.5 leading-relaxed">{renderText(message.text)}</div>

          {/* Copy on hover */}
          <button
            onClick={handleCopy}
            className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full
                       bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600
                       flex items-center justify-center opacity-0 group-hover:opacity-100
                       hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-150"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
            title="Copy message"
          >
            <Fa
              icon={copied ? faCheck : faCopy}
              size={11}
              className={copied ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-400'}
            />
          </button>
        </div>

        <span className="text-[11px] text-slate-400 dark:text-slate-500 px-1
                         opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

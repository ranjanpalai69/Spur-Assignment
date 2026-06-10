import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { faPaperPlane, faFaceSmile, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { Fa } from './ui/Fa';

const MAX_CHARS = 2000;

interface InputBarProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export default function InputBar({ onSend, isLoading }: InputBarProps) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  const remaining = MAX_CHARS - text.length;
  const isOverLimit = remaining < 0;
  const canSend = text.trim().length > 0 && !isLoading && !isOverLimit;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const wrapperBorder = isOverLimit
    ? '#f87171'
    : focused
      ? 'rgba(99,102,241,0.5)'
      : undefined;

  const wrapperShadow = focused && !isOverLimit
    ? '0 0 0 3px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.04)'
    : '0 1px 4px rgba(0,0,0,0.04)';

  return (
    <div className="shrink-0 px-4 py-4 bg-white dark:bg-slate-900
                    border-t border-slate-100 dark:border-slate-800">
      <div
        className="rounded-2xl bg-slate-50 dark:bg-slate-800 transition-all duration-200
                   border border-slate-200 dark:border-slate-700"
        style={{ borderColor: wrapperBorder, boxShadow: wrapperShadow }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type a message…"
          rows={1}
          disabled={isLoading}
          className="w-full bg-transparent resize-none px-4 pt-3.5 pb-1 text-sm
                     text-slate-800 dark:text-slate-100
                     placeholder:text-slate-400 dark:placeholder:text-slate-500
                     focus:outline-none disabled:opacity-60 max-h-40 leading-relaxed scrollbar-none"
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              tabIndex={-1}
              title="Emoji"
              className="p-1.5 rounded-lg transition-all duration-150 active:scale-90
                         text-slate-400 dark:text-slate-500
                         hover:text-slate-600 dark:hover:text-slate-300
                         hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Fa icon={faFaceSmile} size={15} />
            </button>
            <button
              type="button"
              tabIndex={-1}
              title="Attach file"
              className="p-1.5 rounded-lg transition-all duration-150 active:scale-90
                         text-slate-400 dark:text-slate-500
                         hover:text-slate-600 dark:hover:text-slate-300
                         hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Fa icon={faPaperclip} size={15} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {remaining < 300 && (
              <span
                className="text-[11px] tabular-nums font-medium transition-colors"
                style={{ color: isOverLimit ? '#ef4444' : '#f59e0b' }}
              >
                {remaining}
              </span>
            )}
            <button
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              className={[
                'flex items-center justify-center w-8 h-8 rounded-xl',
                'transition-all duration-150',
                canSend
                  ? 'active:scale-90 hover:scale-105'
                  : 'opacity-40 cursor-not-allowed',
              ].join(' ')}
              style={
                canSend
                  ? {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      color: 'white',
                      boxShadow: '0 2px 10px rgba(99,102,241,0.4)',
                    }
                  : {
                      background: 'transparent',
                      border: '1.5px solid currentColor',
                      color: '#94a3b8',
                    }
              }
            >
              {isLoading ? (
                <span
                  className="w-3.5 h-3.5 rounded-full border-2 animate-spin-fast"
                  style={{ borderColor: 'rgba(255,255,255,0.25)', borderTopColor: 'white' }}
                />
              ) : (
                <Fa icon={faPaperPlane} size={13} />
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-2 select-none">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}

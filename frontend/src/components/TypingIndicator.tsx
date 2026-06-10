export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-slide-up">
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

      <div
        className="bg-white dark:bg-slate-800 px-4 py-3.5 rounded-2xl rounded-bl-md
                   border border-slate-100 dark:border-slate-700/50"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 180, 360].map((delay, i) => (
            <span
              key={i}
              className="block w-2 h-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                animation: `bounceDot 1.2s ease-in-out ${delay}ms infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

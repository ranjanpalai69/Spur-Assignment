import {
  faBagShopping,
  faTruck,
  faArrowRotateLeft,
  faCreditCard,
  faClock,
  faCircleQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { Fa } from './ui/Fa';

interface WelcomeScreenProps {
  onQuickQuestion: (q: string) => void;
}

const QUICK_QUESTIONS = [
  {
    icon: faArrowRotateLeft,
    label: "What's your return policy?",
    iconClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-900/20',
    hoverBg: 'hover:bg-violet-100 dark:hover:bg-violet-900/30',
    hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-700',
    hoverText: 'hover:text-violet-700 dark:hover:text-violet-300',
  },
  {
    icon: faTruck,
    label: 'Do you ship internationally?',
    iconClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
    hoverText: 'hover:text-blue-700 dark:hover:text-blue-300',
  },
  {
    icon: faBagShopping,
    label: 'How do I track my order?',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
    hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    hoverText: 'hover:text-emerald-700 dark:hover:text-emerald-300',
  },
  {
    icon: faCreditCard,
    label: 'What payment methods do you accept?',
    iconClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
    hoverText: 'hover:text-amber-700 dark:hover:text-amber-300',
  },
  {
    icon: faClock,
    label: 'What are your support hours?',
    iconClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-900/20',
    hoverBg: 'hover:bg-rose-100 dark:hover:bg-rose-900/30',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700',
    hoverText: 'hover:text-rose-700 dark:hover:text-rose-300',
  },
  {
    icon: faCircleQuestion,
    label: 'Can I cancel or modify my order?',
    iconClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-50 dark:bg-indigo-900/20',
    hoverBg: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
    hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    hoverText: 'hover:text-indigo-700 dark:hover:text-indigo-300',
  },
];

export default function WelcomeScreen({ onQuickQuestion }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 text-center
                    select-none animate-fade-in">
      {/* Avatar */}
      <div className="relative mb-5">
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl
                     text-white text-xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
            boxShadow: '0 8px 28px rgba(99,102,241,0.35)',
          }}
        >
          SE
        </div>
        <div
          className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center
                     w-6 h-6 rounded-full bg-white dark:bg-slate-950"
          style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
        >
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
      </div>

      <h2 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight mb-2">
        How can we help you?
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
        Ask anything about orders, shipping, returns, or payments. Available 24/7.
      </p>

      {/* Quick-action grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {QUICK_QUESTIONS.map(({ icon, label, iconClass, bgClass, hoverBg, hoverBorder, hoverText }) => (
          <button
            key={label}
            onClick={() => onQuickQuestion(label)}
            className={[
              'flex items-center gap-3 px-4 py-3 text-left text-sm rounded-[14px]',
              'text-slate-700 dark:text-slate-300',
              'bg-white dark:bg-slate-800/60',
              'border border-slate-200 dark:border-slate-700/60',
              'active:scale-[0.98] transition-all duration-150',
              hoverBg,
              hoverBorder,
              hoverText,
            ].join(' ')}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${bgClass}`}>
              <Fa icon={icon} size={14} className={iconClass} />
            </span>
            <span className="font-medium leading-snug" style={{ fontSize: '13px' }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

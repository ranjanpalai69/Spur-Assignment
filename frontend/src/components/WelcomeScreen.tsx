import {
  faBagShopping,
  faTruck,
  faArrowRotateLeft,
  faCreditCard,
  faClock,
  faCircleQuestion,
  faBolt,
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
    bgClass: 'bg-violet-100 dark:bg-violet-900/20',
    hoverClass: 'hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/30',
    textHover: 'hover:text-violet-700 dark:hover:text-violet-300',
  },
  {
    icon: faTruck,
    label: 'Do you ship internationally?',
    iconClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-100 dark:bg-blue-900/20',
    hoverClass: 'hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30',
    textHover: 'hover:text-blue-700 dark:hover:text-blue-300',
  },
  {
    icon: faBagShopping,
    label: 'How do I track my order?',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/20',
    hoverClass: 'hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30',
    textHover: 'hover:text-emerald-700 dark:hover:text-emerald-300',
  },
  {
    icon: faCreditCard,
    label: 'What payment methods do you accept?',
    iconClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-100 dark:bg-amber-900/20',
    hoverClass: 'hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30',
    textHover: 'hover:text-amber-700 dark:hover:text-amber-300',
  },
  {
    icon: faClock,
    label: 'What are your support hours?',
    iconClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-100 dark:bg-rose-900/20',
    hoverClass: 'hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30',
    textHover: 'hover:text-rose-700 dark:hover:text-rose-300',
  },
  {
    icon: faCircleQuestion,
    label: 'Can I cancel or modify my order?',
    iconClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/20',
    hoverClass: 'hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
    textHover: 'hover:text-indigo-700 dark:hover:text-indigo-300',
  },
];

export default function WelcomeScreen({ onQuickQuestion }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 text-center
                    select-none animate-fade-in">

      {/* Avatar with glow ring */}
      <div className="relative mb-6 animate-pop">
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-2xl blur-xl opacity-30 scale-110"
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
        />
        <div
          className="relative flex items-center justify-center w-18 h-18 rounded-2xl
                     text-white font-bold"
          style={{
            width: 72,
            height: 72,
            fontSize: 22,
            background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4), 0 2px 8px rgba(99,102,241,0.2)',
          }}
        >
          SE
        </div>
        {/* Online badge */}
        <div
          className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center
                     w-6 h-6 rounded-full bg-white dark:bg-slate-950"
          style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.14)' }}
        >
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse-soft" />
        </div>
      </div>

      {/* Heading */}
      <div className="animate-slide-up" style={{ animationDelay: '0.04s' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Fa icon={faBolt} size={11} className="text-indigo-400" />
          <span className="text-xs font-semibold tracking-widest uppercase
                           text-indigo-500 dark:text-indigo-400">
            AI-powered support
          </span>
          <Fa icon={faBolt} size={11} className="text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
          How can we help you?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
          Ask anything about orders, shipping, returns, or payments.
          Available 24/7 — instant answers.
        </p>
      </div>

      {/* Quick-action grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg mt-8 animate-slide-up"
        style={{ animationDelay: '0.08s' }}
      >
        {QUICK_QUESTIONS.map(({ icon, label, iconClass, bgClass, hoverClass, textHover }) => (
          <button
            key={label}
            onClick={() => onQuickQuestion(label)}
            className={[
              'flex items-center gap-3 px-4 py-3 text-left rounded-2xl',
              'text-slate-700 dark:text-slate-300',
              'bg-white dark:bg-slate-800/60',
              'border border-slate-200 dark:border-slate-700/60',
              'active:scale-[0.97] transition-all duration-200',
              hoverClass,
              textHover,
            ].join(' ')}
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <span className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${bgClass}`}>
              <Fa icon={icon} size={14} className={iconClass} />
            </span>
            <span className="font-medium leading-snug" style={{ fontSize: '13px' }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { cardClass } from '@/lib/styles';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  tone?: 'default' | 'light';
}

export default function Modal({ onClose, children, tone = 'default' }: ModalProps) {
  const isLight = tone === 'light';

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#071b2a]/65 p-4 backdrop-blur-sm animate-fade-in sm:items-center"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className={`relative w-full max-w-md p-6 sm:p-8 animate-slide-up ${
          isLight
            ? 'rounded-[2rem] border border-white bg-white p-5 text-slate-900 shadow-2xl shadow-slate-900/25 sm:p-7'
            : cardClass
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40 ${
            isLight
              ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
          }`}
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

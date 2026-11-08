import { CheckCircle2 } from 'lucide-react';
import Modal from '@/components/Modal';
import { formatAmount } from '@/lib/format';
import { primaryButtonClass } from '@/lib/styles';

interface ClaimSuccessModalProps {
  amount: number;
  remaining: number;
  onClose: () => void;
}

export default function ClaimSuccessModal({ amount, remaining, onClose }: ClaimSuccessModalProps) {
  const date = new Intl.DateTimeFormat('en-NG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  return (
    <Modal onClose={onClose} tone="light">
      <div className="overflow-hidden rounded-2xl border border-sky-200 bg-sky-50 text-slate-950 shadow-sm">
        <div className="flex flex-col items-center border-b-2 border-dashed border-slate-400 px-5 pb-5 pt-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-white bg-lime-500 text-white shadow-md">
            <CheckCircle2 size={34} strokeWidth={2.5} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-lime-600">Payment successful!</h2>
        </div>

        <div className="space-y-4 px-5 py-5 text-sm">
          <div className="flex items-center justify-between gap-4 border-b border-dashed border-slate-400 pb-3">
            <span className="font-semibold">Amount:</span>
            <span className="text-right text-lg font-bold">₦{formatAmount(amount)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-dashed border-slate-400 pb-3">
            <span className="font-semibold">Date:</span>
            <span className="font-bold">{date}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold">Available today:</span>
            <span className="text-right font-bold">₦{formatAmount(remaining)}</span>
          </div>
        </div>

        <p className="px-5 pb-6 text-center text-lg font-bold text-slate-950">
          Funds will reflect in 10 mins time.
        </p>
      </div>

      <button type="button" onClick={onClose} className={`mt-6 ${primaryButtonClass}`}>
        Done
      </button>
    </Modal>
  );
}

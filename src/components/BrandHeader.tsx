interface BrandHeaderProps {
  subtitle?: string;
}

export default function BrandHeader({ subtitle }: BrandHeaderProps) {
  return (
    <div className="text-center">
      <h1 className="pl-[0.24em] text-5xl font-bold tracking-[0.24em] text-slate-950 sm:text-6xl dark:text-slate-50">
        VATAR
      </h1>
      {subtitle && <p className="mt-5 text-lg text-slate-600 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}

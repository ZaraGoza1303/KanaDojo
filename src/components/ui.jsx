import React from 'react'

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-slate-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 shadow-sm',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    ghost: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-200 dark:border-zinc-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warn: 'bg-amber-500 hover:bg-amber-600 text-white',
  }
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors active:scale-[0.98] disabled:opacity-40 ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function ProgressBar({ value, max = 100, className = '', barClassName = '' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700 ${className}`}>
      <div className={`h-full rounded-full bg-slate-900 dark:bg-zinc-100 transition-all duration-500 ${barClassName}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function StatCard({ label, value, sub, accent = 'text-slate-900 dark:text-zinc-100' }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">{label}</div>
      <div className={`mt-1 text-xl font-bold sm:text-2xl ${accent}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{sub}</div>}
    </Card>
  )
}

export function Segmented({ options, value, onChange, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-zinc-600 dark:bg-zinc-700 ${className}`}>
      {options.map((opt) => (
        <button key={String(opt.value)} onClick={() => onChange(opt.value)} className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${value === opt.value ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white'}`}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300">
      <span className={`relative h-6 w-11 rounded-full border transition-colors ${checked ? 'bg-zinc-800 dark:bg-zinc-700 border-zinc-800 dark:border-zinc-600' : 'bg-slate-300 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[1.35rem]' : 'left-0.5'}`} />
      </span>
      {label && <span>{label}</span>}
    </button>
  )
}

export function Badge({ children, tone = 'slate', className = '' }) {
  const tones = {
    indigo: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    rose: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    cyan: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600',
  }
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>{children}</span>
}

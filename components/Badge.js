const variants = {
  critical: 'bg-critical-bg text-critical-text border-critical-border',
  warning:  'bg-warning-bg  text-warning-text  border-warning-border',
  success:  'bg-success-bg  text-success-text  border-success-border',
  info:     'bg-info-bg     text-info-text     border-info-border',
  neutral:  'bg-neutral-bg  text-neutral-text  border-neutral-border',
}

export default function Badge({ variant = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-2xs font-semibold border ${variants[variant]}`}>
      {children}
    </span>
  )
}

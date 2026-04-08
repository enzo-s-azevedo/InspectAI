export default function Topbar({ breadcrumb }) {
  return (
    <header className="bg-bg-panel border-b border-border flex items-center px-5 gap-4 h-[48px] col-span-2">
      {/* Logo */}
      <div className="flex items-center gap-2 font-mono text-[15px] font-semibold text-amber tracking-wide">
        <div className="w-6 h-6 border border-amber rounded flex items-center justify-center">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
            <rect x="1" y="1" width="12" height="12" rx="1"/>
            <circle cx="7" cy="7" r="2"/>
            <line x1="7" y1="1" x2="7" y2="3"/>
            <line x1="7" y1="11" x2="7" y2="13"/>
            <line x1="1" y1="7" x2="3" y2="7"/>
            <line x1="11" y1="7" x2="13" y2="7"/>
          </svg>
        </div>
        InspectAI
      </div>

      {/* Breadcrumb */}
      {breadcrumb && (
        <span className="font-mono text-xs text-text-muted">{breadcrumb}</span>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-success-text shadow-green" />
          Sistema online
        </div>
        <div className="w-7 h-7 rounded-full bg-bg-elevated border border-border flex items-center justify-center font-mono text-xs font-semibold text-amber">
          JL
        </div>
      </div>
    </header>
  )
}

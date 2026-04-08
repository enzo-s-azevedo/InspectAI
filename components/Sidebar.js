'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    section: 'Análise',
    links: [
      {
        href: '/',
        label: 'Dashboard',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[15px] h-[15px] flex-shrink-0">
            <rect x="1" y="1" width="6" height="6" rx="1"/>
            <rect x="9" y="1" width="6" height="6" rx="1"/>
            <rect x="1" y="9" width="6" height="6" rx="1"/>
            <rect x="9" y="9" width="6" height="6" rx="1"/>
          </svg>
        ),
      },
      {
        href: '/imagens',
        label: 'Imagens',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[15px] h-[15px] flex-shrink-0">
            <rect x="2" y="2" width="12" height="12" rx="1"/>
            <circle cx="8" cy="8" r="2.5"/>
            <line x1="8" y1="2" x2="8" y2="4"/>
            <line x1="8" y1="12" x2="8" y2="14"/>
          </svg>
        ),
      },
      {
        href: '/videos',
        label: 'Vídeos',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[15px] h-[15px] flex-shrink-0">
            <circle cx="8" cy="8" r="6"/>
            <polygon points="6,5 12,8 6,11"/>
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Gestão',
    links: [
      {
        href: '/defeitos',
        label: 'Defeitos',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[15px] h-[15px] flex-shrink-0">
            <ellipse cx="8" cy="5" rx="5" ry="2.5"/>
            <path d="M3 5v4c0 1.38 2.24 2.5 5 2.5s5-1.12 5-2.5V5"/>
          </svg>
        ),
      },
      {
        href: '/relatorios',
        label: 'Relatórios',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[15px] h-[15px] flex-shrink-0">
            <path d="M4 13V9m4 4V5m4 8V7"/>
          </svg>
        ),
      },
      {
        href: '/usuarios',
        label: 'Usuários',
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[15px] h-[15px] flex-shrink-0">
            <circle cx="6" cy="5" r="3"/>
            <path d="M1 14c0-2.76 2.24-5 5-5"/>
            <circle cx="12" cy="11" r="3"/>
          </svg>
        ),
      },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="bg-bg-panel border-r border-border flex flex-col py-4 gap-1 h-full">
      {navItems.map((group) => (
        <div key={group.section} className="px-3 mb-1">
          <p className="font-mono text-2xs text-text-muted uppercase tracking-label px-2 py-2">
            {group.section}
          </p>
          {group.links.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-all duration-fast
                  ${isActive
                    ? 'bg-amber/5 text-amber border border-amber/15'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}

      <div className="mt-auto px-3 pt-3 border-t border-border/50">
        <Link
          href="/configuracoes"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-all duration-fast border border-transparent"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[15px] h-[15px] flex-shrink-0">
            <circle cx="8" cy="8" r="3"/>
            <path d="M8 1v2m0 10v2M1 8h2m10 0h2M3.05 3.05l1.41 1.41m7.08 7.08l1.41 1.41M3.05 12.95l1.41-1.41m7.08-7.08l1.41-1.41"/>
          </svg>
          Configurações
        </Link>
      </div>
    </aside>
  )
}

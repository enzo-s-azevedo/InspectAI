'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppShell({ children, breadcrumb }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const menus = {
    analise: [
      { name: 'Dashboard', icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>, path: '/' },
      { name: 'Imagens',   icon: <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-3 9l4.5-6 3.5 4.5 2.5-3 4.5 4.5H5.5z"/>, path: '/imagens' },
      { name: 'Vídeos',    icon: <path d="M23 7l-7 5 7 5V7zM1 5h14v14H1V5z"/>, path: '/videos' },
    ],
    controle: [
      { name: 'Defeitos',   icon: <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>, path: '/defeitos' },
      { name: 'Relatórios', icon: <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>, path: '/relatorios' },
    ],
    sistema: [
      { name: 'Usuários',   icon: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"/>, path: '/usuarios' },
    ]
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base relative">
      
      {/* MODAL DE AJUDA */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-bg-panel border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center bg-bg-elevated/20">
              <div>
                <h3 className="font-mono text-sm font-black uppercase text-amber tracking-widest italic">Central de Ajuda</h3>
                <p className="text-[9px] text-text-muted uppercase font-mono mt-0.5 tracking-tight italic">Terminal Ativo · Suporte 24h</p>
              </div>
              <button onClick={() => setIsHelpOpen(false)} className="text-text-muted hover:text-white transition-colors p-2 rounded-full hover:bg-bg-elevated">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
                <section className="space-y-3">
                    <details className="bg-bg-base border border-border rounded-lg group overflow-hidden">
                        <summary className="p-3 text-xs font-bold text-text-secondary cursor-pointer hover:bg-bg-elevated transition-colors list-none flex justify-between items-center">
                        Como solicitar suporte técnico?
                        <span className="text-amber group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="p-3 text-[11px] text-text-muted border-t border-border bg-bg-elevated/5 leading-relaxed">
                        Para problemas de detecção ou erros de hardware, entre em contato direto com a engenharia através do ramal interno ou utilize o canal 0800 abaixo.
                        </div>
                    </details>
                </section>
                <div className="bg-bg-elevated/40 border border-border p-4 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber/10 rounded-full flex items-center justify-center shrink-0 border border-amber/20">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-primary uppercase tracking-tighter">Engenharia de Plantão</p>
                        <p className="text-[11px] text-text-muted">Suporte Direto: <span className="text-amber font-bold italic">0800 400 200</span></p>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-border bg-bg-base/50">
              <button onClick={() => setIsHelpOpen(false)} className="w-full py-3 bg-amber text-black font-mono text-[10px] font-black uppercase rounded-lg hover:bg-amber-600 transition-all">Voltar ao Sistema</button>
            </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-bg-panel border-r border-border flex flex-col transition-all duration-300 ease-in-out z-50 shadow-2xl overflow-x-hidden`}>
        
        {/* Header: Logo e Toggle */}
        <div className={`flex flex-col items-center border-b border-border shrink-0 gap-4 transition-all duration-300 ${isCollapsed ? 'py-5' : 'p-6'}`}>
          <Link href="/" className="flex items-center justify-center w-full group/logo active:scale-95 transition-all cursor-pointer">
            <div className="w-9 h-9 bg-amber rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-amber/20 group-hover/logo:shadow-amber/40 transition-all">
                <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
            </div>
            {!isCollapsed && <span className="ml-3 font-mono text-xl font-black tracking-tighter text-text-primary uppercase group-hover/logo:text-amber transition-colors">InspectAI</span>}
          </Link>

          <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-10 h-10 flex items-center justify-center rounded-md bg-bg-elevated hover:bg-amber/10 hover:text-amber text-text-muted transition-all border border-border/50 active:scale-90">
            <svg className={`w-5 h-5 transition-transform duration-500 ${isCollapsed ? '' : 'rotate-90'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="16" x2="20" y2="16"/></svg>
          </button>
        </div>

        {/* Navegação */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-8">
          {Object.entries(menus).map(([key, items]) => (
            <div key={key}>
              {!isCollapsed && <p className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-3">{key === 'analise' ? 'Análise' : key === 'controle' ? 'Controle' : 'Sistema'}</p>}
              <nav className="space-y-1">
                {items.map((item) => (
                  <Link 
                    key={item.name} 
                    href={item.path}
                    title={isCollapsed ? item.name : ''}
                    className={`flex items-center h-11 px-3 rounded-lg transition-all group ${pathname === item.path ? 'bg-amber/10 text-amber border-l-2 border-amber' : 'text-text-muted hover:bg-bg-elevated hover:text-text-secondary border-l-2 border-transparent'}`}
                  >
                    <svg className={`w-5 h-5 shrink-0 transition-transform ${pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
                    {!isCollapsed && <span className="ml-3 font-mono text-xs font-medium tracking-tight uppercase">{item.name}</span>}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div className="mt-auto border-t border-border/30 p-4 space-y-4">
          <button 
            onClick={() => setIsHelpOpen(true)}
            title={isCollapsed ? "Ajuda" : ""}
            className="flex items-center gap-3 w-full px-2 py-1.5 text-text-muted hover:text-amber transition-colors group"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {!isCollapsed && <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Ajuda</span>}
          </button>

          <div className={`flex items-center gap-3 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-text opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success-text"></span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-text-primary font-bold leading-none uppercase tracking-tighter">Engine: v1.0.4</span>
                <span className="text-[8px] font-mono text-text-muted uppercase tracking-tighter">Latência: 12ms</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* --- CONTEÚDO --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg-base">
        <header className="h-12 border-b border-border bg-bg-panel flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="font-mono text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-2">
            <span className="opacity-40 italic">InspectAI</span><span className="text-amber">/</span>{breadcrumb}
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-text-muted uppercase tracking-tighter">System:</span>
                <span className="font-mono text-[10px] text-success-text uppercase font-bold tracking-widest">Online</span>
             </div>
             <div className="w-7 h-7 bg-amber/10 rounded border border-amber/20 flex items-center justify-center font-mono text-[10px] text-amber font-bold">JL</div>
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
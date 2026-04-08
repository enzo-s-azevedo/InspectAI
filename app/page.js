'use client'
import AppShell from '@/components/AppShell'
import Link from 'next/link'

export default function HomePage() {
  return (
    <AppShell breadcrumb="Início">
      <div className="p-8 max-w-7xl mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            CONTROLE <span className="text-fuchsia-500 underline decoration-fuchsia-500/30">INSPECTAI</span>
          </h1>
          <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em]">Terminal de Monitoramento · v1.0.4</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/imagens" className="group bg-white/[0.02] border border-white/10 p-8 rounded-2xl hover:border-fuchsia-500/50 transition-all hover:bg-fuchsia-500/[0.02]">
            <div className="w-12 h-12 bg-fuchsia-500/10 text-fuchsia-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(192,38,211,0.1)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <h3 className="text-sm font-black text-white uppercase mb-2 tracking-widest">Inspeção de Imagens</h3>
            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-mono">Processamento de lotes estáticos via IA.</p>
          </Link>

          <Link href="/videos" className="group bg-white/[0.02] border border-white/10 p-8 rounded-2xl hover:border-fuchsia-500/50 transition-all hover:bg-fuchsia-500/[0.02]">
            <div className="w-12 h-12 bg-fuchsia-500/10 text-fuchsia-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(192,38,211,0.1)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <h3 className="text-sm font-black text-white uppercase mb-2 tracking-widest">Feed Realtime</h3>
            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-mono">Monitoramento dinâmico de fluxo contínuo.</p>
          </Link>

          <Link href="/relatorios" className="group bg-white/[0.02] border border-white/10 p-8 rounded-2xl hover:border-fuchsia-500/50 transition-all hover:bg-fuchsia-500/[0.02]">
            <div className="w-12 h-12 bg-fuchsia-500/10 text-fuchsia-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(192,38,211,0.1)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 className="text-sm font-black text-white uppercase mb-2 tracking-widest">Relatórios</h3>
            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-mono">Gestão de histórico e exportação de logs.</p>
          </Link>
        </div>

        <div className="p-8 bg-white/[0.01] border border-white/5 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-12">
            <div><p className="text-[9px] text-white/20 uppercase font-black mb-2 tracking-widest">IA Accuracy</p><p className="text-3xl font-black text-white italic">99.4%</p></div>
            <div><p className="text-[9px] text-white/20 uppercase font-black mb-2 tracking-widest">Placas/h</p><p className="text-3xl font-black text-white italic">1,240</p></div>
            <div><p className="text-[9px] text-white/20 uppercase font-black mb-2 tracking-widest">Uptime</p><p className="text-3xl font-black text-white italic">14d 08h</p></div>
            <div><p className="text-[9px] text-white/20 uppercase font-black mb-2 tracking-widest">Latency</p><p className="text-3xl font-black text-white italic text-fuchsia-500">12ms</p></div>
        </div>
      </div>
    </AppShell>
  )
}
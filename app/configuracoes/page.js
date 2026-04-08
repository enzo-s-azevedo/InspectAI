'use client'
import AppShell from '@/components/AppShell'

export default function AjustesPage() {
  return (
    <AppShell breadcrumb="Sistema / Ajustes">
      <div className="p-8 max-w-2xl mx-auto space-y-12">
        <header>
          <h2 className="text-2xl font-black text-white uppercase italic">Configurações</h2>
          <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-mono">Terminal Profile & Core Connection</p>
        </header>

        <section className="space-y-6">
          <div className="space-y-4 border-l-2 border-fuchsia-500 pl-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Identificação do Operador</h4>
            <div className="grid gap-4">
              <input type="text" placeholder="Nome Completo" className="bg-white/5 border border-white/10 p-3 rounded text-[11px] outline-none focus:border-fuchsia-500 transition-colors" />
              <input type="text" placeholder="Matrícula / ID" className="bg-white/5 border border-white/10 p-3 rounded text-[11px] outline-none focus:border-fuchsia-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-4 border-l-2 border-white/10 pl-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Conexão com o Servidor</h4>
            <div className="grid gap-4">
              <div className="flex gap-2">
                <input type="text" placeholder="IP do Host" defaultValue="192.168.1.104" className="flex-1 bg-white/5 border border-white/10 p-3 rounded text-[11px] font-mono text-fuchsia-500 outline-none" />
                <input type="text" placeholder="Porta" defaultValue="8000" className="w-24 bg-white/5 border border-white/10 p-3 rounded text-[11px] font-mono text-fuchsia-500 outline-none" />
              </div>
            </div>
          </div>
        </section>

        <button className="w-full py-3 bg-white text-black font-mono text-[10px] font-black uppercase rounded hover:bg-fuchsia-500 hover:text-white transition-all">
          Salvar Alterações
        </button>
      </div>
    </AppShell>
  )
}
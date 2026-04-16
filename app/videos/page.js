'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import { api } from '@/services/api'
import { toast } from 'sonner'

export default function FeedVideo() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const defeitos = await api.getDefeitos()
        const mapped = defeitos.slice(0, 8).map((item, index) => ({
          id: item.codigoInterno,
          tipo: item.tipo,
          tempo: String(index * 11).padStart(2, '0'),
        }))
        setLogs(mapped)
      } catch (error) {
        toast.error(error.message)
      }
    }

    loadLogs()
  }, [])

  return (
    <AppShell breadcrumb="Análise / Vídeos / Lote_B047_Run01.mp4">
      <div className="p-4 h-[calc(100vh-48px)] flex flex-col gap-4 bg-[#0a0a0a] text-white font-sans">
        
        {/* BARRA SUPERIOR (HEADER) */}
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div>
              <h2 className="text-[13px] font-bold tracking-tight">Lote_B047_Run01.mp4</h2>
              <p className="text-[9px] text-white/30 uppercase font-mono tracking-widest italic">Câmera Principal · 60 FPS · HEVC</p>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[9px] uppercase rounded-md transition-all shadow-lg shadow-purple-500/20">
              Exportar Formulário
            </button>
          </div>
        </div>

        {/* ÁREA CENTRAL (VÍDEO + SIDEBAR) */}
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
          
          {/* PLAYER DE VÍDEO (CANVAS) */}
          <div className="flex-[4] bg-black/40 border border-white/5 rounded-lg relative overflow-hidden flex items-center justify-center">
            {/* Grid de fundo sutil */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            
            {/* Status: Mecanismo de Visão (Topo Esquerdo) */}
            <div className="absolute top-6 left-6 flex items-start gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
               <div className="leading-tight">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/90">Mecanismo de Visão</p>
                  <p className="text-[8px] text-white/30 uppercase font-mono">Stand-by</p>
               </div>
            </div>

            {/* Bounding Boxes (Simulação fiel ao print) */}
            <div className="relative w-[80%] h-[75%] border border-white/5">
                {/* #V-01 */}
                <div className="absolute top-[20%] left-[15%] w-24 h-24 border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <span className="absolute -top-4 left-0 bg-red-500 text-white text-[7px] font-black px-1 uppercase italic">#V-01 - Curto-circuito</span>
                </div>
                {/* #V-02 */}
                <div className="absolute bottom-[40%] right-[25%] w-20 h-20 border border-orange-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                    <span className="absolute -top-4 left-0 bg-orange-400 text-white text-[7px] font-black px-1 uppercase italic">#V-02 - Solda fria</span>
                </div>
                {/* #V-03 */}
                <div className="absolute bottom-[10%] left-[30%] w-28 h-28 border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <span className="absolute -top-4 left-0 bg-red-500 text-white text-[7px] font-black px-1 uppercase italic">#V-03 - Comp. ausente</span>
                </div>
            </div>
          </div>

          {/* SIDEBAR: Logs de Captura */}
          <div className="w-72 flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 italic">Logs de Captura</h3>
              <span className="w-5 h-5 bg-white/5 rounded flex items-center justify-center text-[10px] font-mono text-purple-400 border border-white/10">3</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {logs.map((log) => (
                <div key={log.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-md hover:bg-white/[0.04] transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-purple-500 font-bold tracking-tighter">{log.id}</span>
                    <span className="text-[8px] text-white/20 font-mono italic">{log.tempo}</span>
                  </div>
                  <h4 className="text-[11px] font-bold text-white mb-4 tracking-tight">{log.tipo}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-1.5 text-[8px] font-black uppercase bg-white/5 hover:bg-white/10 rounded border border-white/10 text-white/40 hover:text-white transition-all">Replay</button>
                    <button className="py-1.5 text-[8px] font-black uppercase bg-white/5 hover:bg-white/10 rounded border border-white/10 text-white/40 hover:text-red-500 transition-all">Descartar</button>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-md text-[10px] uppercase font-mono text-white/30">
                  Sem eventos recentes no banco.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TIMELINE (RODAPÉ DO PLAYER) */}
        <div className="space-y-2 shrink-0 px-2 pb-2">
           <div className="flex-1 h-[2px] bg-white/5 rounded-full relative mt-8">
              {/* Marcadores de evento na timeline */}
              <div className="absolute left-[12%] top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              <div className="absolute left-[45%] top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
              <div className="absolute left-[78%] top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              
              {/* Marcador de posição atual (Playhead) */}
              <div className="absolute left-[38%] top-1/2 -translate-y-1/2 w-1 h-6 bg-white shadow-xl rounded-full"></div>
           </div>
           
           <div className="flex justify-between text-[10px] font-mono text-white/20 tracking-widest uppercase">
              <span>00:00:00</span>
              <span className="text-[8px] font-black italic tracking-[0.4em] opacity-40">Playback Pausado</span>
              <span>00:02:00</span>
           </div>
        </div>
      </div>
    </AppShell>
  )
}
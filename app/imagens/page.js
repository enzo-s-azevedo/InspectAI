'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'

export default function InspecaoImagens() {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentDefectData, setCurrentDefectData] = useState({
    nome: 'R/CFaltante',
    status: 'Defeito'
  })

  return (
    <AppShell breadcrumb="Análise / Scanner de PCBs">
      <div className="p-6 h-[calc(100vh-48px)] flex flex-col gap-6 overflow-hidden relative">
        
        {/* MODAL DE EDIÇÃO (O Formulário que você pediu) */}
        {isEditOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="font-mono text-sm font-black uppercase text-fuchsia-500 tracking-widest italic">Editar Detecção</h3>
                <p className="text-[10px] text-white/40 uppercase mt-1">Corrigir dados da Visão Computacional</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[9px] text-white/40 uppercase font-black mb-2 block tracking-widest">Nome do Defeito / Componente</label>
                  <input 
                    type="text" 
                    defaultValue={currentDefectData.nome}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-xs text-white outline-none focus:border-fuchsia-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-white/40 uppercase font-black mb-2 block tracking-widest">Status Real</label>
                  <select className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-xs text-white outline-none focus:border-fuchsia-500 transition-colors font-mono appearance-none">
                    <option>Defeito Confirmado</option>
                    <option>Peça OK (Falso Positivo)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-3">
                <button onClick={() => setIsEditOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors">Cancelar</button>
                <button onClick={() => setIsEditOpen(false)} className="flex-1 py-3 bg-fuchsia-600 text-white font-mono text-[10px] font-black uppercase rounded-lg hover:bg-fuchsia-500 transition-all shadow-lg">Atualizar Dados</button>
              </div>
            </div>
          </div>
        )}

        {/* BARRA SUPERIOR */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl shadow-xl shrink-0">
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Carregar Imagem</button>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Carregar Pasta</button>
          </div>
          <div className="flex-1 max-w-xl hidden md:block">
            <p className="text-[9px] text-white/30 uppercase font-mono mb-1 tracking-wider">Classes Detectadas</p>
            <div className="bg-black/40 border border-white/5 p-2 rounded text-[10px] font-mono text-fuchsia-400">C-, R-, U-, R/CFaltante, UFaltante</div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-white/30 uppercase font-mono">Modelo</p>
            <p className="text-[10px] text-emerald-500 font-mono italic">YOLO v8 High-Res</p>
          </div>
        </div>

        {/* DUAL VIEW GRID */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Painel Esquerdo: Original */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
               <span className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">PCBs Originais</span>
               <span className="text-[10px] font-mono text-fuchsia-500">1 / 11</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 bg-black/40">
              <div className="flex flex-col items-center gap-2 text-center text-white/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span className="font-mono text-[9px] uppercase tracking-widest">Aguardando Imagem Principal</span>
              </div>
            </div>
            <div className="p-4 border-t border-white/5 flex justify-between bg-white/[0.01]">
              <button className="p-2 hover:text-fuchsia-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg></button>
              <button className="p-2 hover:text-fuchsia-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg></button>
            </div>
          </div>

          {/* Painel Direito: Defeito */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
               <span className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Foco no Defeito</span>
               <span className="text-[10px] font-mono text-fuchsia-500">Defeito: 1 / 4</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 bg-black/40">
               <div className="w-full h-full border border-white/5 rounded-xl border-dashed flex flex-col items-center justify-center gap-2 text-white/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                <span className="font-mono text-[9px] uppercase tracking-widest">Região Ampliada</span>
              </div>
            </div>
            <div className="p-4 border-t border-white/5 flex justify-between items-center bg-white/[0.01]">
              <button className="text-[10px] font-black uppercase flex items-center gap-2 hover:text-fuchsia-500 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7"/></svg>Anterior</button>
              <button className="text-[10px] font-black uppercase flex items-center gap-2 hover:text-fuchsia-500 transition-all">Próximo<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7"/></svg></button>
            </div>
          </div>
        </div>

        {/* FOOTER: Resultado e Ações */}
        <div className="bg-[#0d0d0d] border border-white/5 p-6 rounded-2xl shadow-2xl shrink-0">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="space-y-1">
                <h3 className="text-sm font-black text-white uppercase italic">Análise: <span className="text-fuchsia-500">{currentDefectData.nome}</span></h3>
                <p className="text-[11px] text-white/50 font-mono tracking-tight leading-relaxed max-w-lg">
                   IA detectou um possível erro no componente. Valide se a peça está correta ou se é um falso positivo.
                </p>
             </div>
             
             <div className="flex gap-4 w-full md:w-auto">
                <button 
                  onClick={() => setIsEditOpen(true)}
                  className="flex-1 md:flex-none px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 transition-all"
                >
                  Falso Positivo / Editar
                </button>
                <button className="flex-1 md:flex-none px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-fuchsia-500/20 transition-all active:scale-95">
                  Validar Correção
                </button>
             </div>
           </div>
        </div>
      </div>
    </AppShell>
  )
}
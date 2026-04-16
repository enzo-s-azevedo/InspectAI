'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import { api } from '@/services/api'
import { toast } from 'sonner'

export default function RelatoriosPage() {
  const [relatorios, setRelatorios] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRelatorios = async () => {
      try {
        setIsLoading(true)
        const data = await api.getRelatorios()
        setRelatorios(data)
      } catch (error) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadRelatorios()
  }, [])

  const humanStatus = (status) => {
    if (status === 'finalizado') return 'Concluido'
    if (status === 'rascunho') return 'Rascunho'
    return status
  }

  return (
    <AppShell breadcrumb="Controle / Relatórios">
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white uppercase italic">Repositório de Dados</h2>
            <button className="px-6 py-2 bg-white text-black font-mono text-[10px] font-black uppercase rounded hover:bg-fuchsia-500 hover:text-white transition-all">Novo Relatório</button>
        </div>

        <div className="grid gap-3">
          {!isLoading && relatorios.map((rel) => (
            <div key={rel.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-white/10 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-tight">{rel.titulo}</p>
                  <p className="text-[9px] text-white/20 font-mono uppercase tracking-widest">
                    {new Date(rel.criado).toLocaleDateString('pt-BR')} · {humanStatus(rel.status)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button title="Editar" className="p-2 hover:text-fuchsia-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button title="Excluir" className="p-2 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl text-center text-[10px] uppercase font-mono text-white/30">
              Carregando relatorios...
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
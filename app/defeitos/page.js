'use client'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/AppShell'
import { api } from '@/services/api'
import { toast } from 'sonner'

export default function DefeitosPage() {
  const [defeitos, setDefeitos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDefeitos = async () => {
      try {
        setIsLoading(true)
        const data = await api.getDefeitos()
        setDefeitos(data)
      } catch (error) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadDefeitos()
  }, [])

  const totals = useMemo(() => {
    const total = defeitos.length
    const erros = defeitos.filter((item) => item.status !== 'descartado').length
    const falsosPositivos = defeitos.filter((item) => item.status === 'descartado').length
    return { total, erros, falsosPositivos }
  }, [defeitos])

  const statusUi = (status) => {
    if (status === 'descartado') return { label: 'FALSO POSITIVO', className: 'bg-fuchsia-500/10 text-fuchsia-500' }
    if (status === 'resolvido') return { label: 'VALIDADO', className: 'bg-emerald-500/10 text-emerald-400' }
    return { label: 'ERRO', className: 'bg-red-500/10 text-red-500' }
  }

  return (
    <AppShell breadcrumb="Controle / Defeitos">
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">Total de Registros</p>
            <p className="text-2xl font-black text-white italic">{totals.total}</p>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <p className="text-[9px] text-white/20 uppercase font-black tracking-widest text-red-500/50">Erros Confirmados</p>
            <p className="text-2xl font-black text-red-500 italic">{totals.erros}</p>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <p className="text-[9px] text-white/20 uppercase font-black tracking-widest text-fuchsia-500/50">Falsos Positivos</p>
            <p className="text-2xl font-black text-fuchsia-500 italic">{totals.falsosPositivos}</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-white/[0.03] text-white/40 uppercase font-black tracking-tighter">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Componente</th>
                <th className="px-6 py-4">Status (ADM)</th>
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!isLoading && defeitos.map((def) => {
                const status = statusUi(def.status)
                return (
                <tr key={def.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4 font-mono text-fuchsia-500">{def.codigoInterno}</td>
                  <td className="px-6 py-4 text-white/70">{def.tipo}</td>
                  <td className="px-6 py-4 text-white/80">{def.componente || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/40">{new Date(def.criado).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-white/60 hover:text-fuchsia-500 uppercase font-black text-[9px]">Taxar Falso Positivo →</button>
                  </td>
                </tr>
              )})}
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-white/30 font-mono uppercase text-[10px]">
                    Carregando defeitos...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
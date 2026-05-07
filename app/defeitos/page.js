'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import Badge from '@/components/Badge'
import { api } from '@/services/api'

const tiposDefeito = ['Todos', 'rachadura', 'oxidacao', 'solda-fria', 'componente-ausente', 'desalinhamento']

// Mapeia status do back para variante do Badge
function getVariant(status) {
  if (status === 'aberto') return 'critical'
  if (status === 'em-analise') return 'warning'
  if (status === 'resolvido') return 'success'
  if (status === 'descartado') return 'neutral'
  return 'neutral'
}

function getLabel(status) {
  const map = {
    'aberto': 'Aberto',
    'em-analise': 'Em análise',
    'resolvido': 'Resolvido',
    'descartado': 'Falso Positivo',
  }
  return map[status] || status
}

export default function DefeitosPage() {
  const [tipoFiltro, setTipoFiltro] = useState('Todos')
  const [search, setSearch] = useState('')
  const [defectList, setDefectList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.getDefeitos()
        setDefectList(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filtered = defectList.filter(d => {
    const matchTipo = tipoFiltro === 'Todos' || d.classe === tipoFiltro || d.tipo === tipoFiltro
    const matchSearch = search === '' ||
      d.codigoInterno?.toLowerCase().includes(search.toLowerCase()) ||
      d.placa?.codigo?.toLowerCase().includes(search.toLowerCase()) ||
      d.classe?.toLowerCase().includes(search.toLowerCase()) ||
      d.tipo?.toLowerCase().includes(search.toLowerCase())
    return matchTipo && matchSearch
  })

  const metrics = [
    { label: 'Total de Defeitos',  value: isLoading ? '-' : defectList.length, color: 'border-t-amber' },
    { label: 'Erros',              value: isLoading ? '-' : defectList.filter(d => d.status === 'aberto' || d.status === 'em-analise').length, color: 'border-t-critical-text' },
    { label: 'Falsos Positivos',   value: isLoading ? '-' : defectList.filter(d => d.status === 'descartado').length, color: 'border-t-neutral-text' },
  ]

  return (
    <AppShell breadcrumb="/ Defeitos">
      <div className="p-6 flex flex-col gap-5">

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Banco de Defeitos</h1>
            <p className="font-mono text-2xs text-text-muted mt-1">
              // {isLoading ? 'Carregando...' : error ? `Erro: ${error}` : `${defectList.length} registros · atualizado agora`}
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-amber text-black rounded-md font-mono text-xs font-semibold hover:bg-amber-600 transition-all duration-fast cursor-pointer">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M2 14l4-4m0 0l6-6M6 10l-2 2"/><path d="M8 2l6 6"/></svg>
            Exportar CSV
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {metrics.map(m => (
            <div key={m.label} className={`bg-bg-card border border-border rounded-xl p-4 border-t-2 ${m.color}`}>
              <p className="font-mono text-2xs text-text-muted uppercase tracking-label mb-2">{m.label}</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-bg-elevated animate-pulse rounded mt-1"></div>
              ) : (
                <p className="font-mono text-3xl font-semibold">{m.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por código, placa ou tipo..."
            disabled={isLoading}
            className="bg-bg-card border border-border text-text-primary font-sans text-xs rounded-md px-3 py-2 w-64 placeholder:text-text-muted focus:border-amber outline-none transition-all duration-fast disabled:opacity-50"
          />
          <div className="flex gap-1.5 flex-wrap">
            {tiposDefeito.map(t => (
              <button
                key={t}
                onClick={() => setTipoFiltro(t)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-md font-mono text-xs border transition-all duration-fast cursor-pointer disabled:opacity-50 ${tipoFiltro === t ? 'bg-amber text-black border-amber font-semibold' : 'border-border text-text-secondary hover:bg-bg-elevated'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {['Código', 'Placa', 'Classe', 'Tipo', 'Severidade', 'Origem', 'Status', 'Data/Hora'].map(h => (
                  <th key={h} className="font-mono text-2xs text-text-muted uppercase tracking-label px-3 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3 w-16 bg-bg-elevated animate-pulse rounded"></div></td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center font-mono text-xs text-critical-text">Erro ao carregar: {error}</td></tr>
              ) : filtered.length > 0 ? (
                filtered.map(d => (
                  <tr key={d.id} className="border-b border-border/30 last:border-0 hover:bg-bg-elevated transition-all duration-fast">
                    <td className="px-3 py-3 font-mono text-xs text-amber">{d.codigoInterno}</td>
                    <td className="px-3 py-3 font-mono text-xs text-text-secondary">{d.placa?.codigo || '-'}</td>
                    <td className="px-3 py-3 text-xs text-text-primary">{d.classe}</td>
                    <td className="px-3 py-3 text-xs text-text-secondary">{d.tipo}</td>
                    <td className="px-3 py-3 text-xs text-text-secondary">{d.severidade}</td>
                    <td className="px-3 py-3 text-xs text-text-secondary">{d.origem}</td>
                    <td className="px-3 py-3"><Badge variant={getVariant(d.status)}>{getLabel(d.status)}</Badge></td>
                    <td className="px-3 py-3 font-mono text-xs text-text-muted">{new Date(d.data_hora || d.criado).toLocaleString('pt-BR')}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="px-3 py-8 text-center font-mono text-xs text-text-muted">Nenhum defeito encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { api } from '@/services/api'

function getClasseDefeito(defeito) {
  return defeito?.classe_defeito || ''
}

function getStatusLabel(status) {
  const labels = {
    confirmado: 'Confirmado',
    falso_positivo: 'Falso positivo',
  }
  return labels[status] || status || 'Confirmado'
}

export default function DefeitosPage() {
  // MOCK DE AUTENTICAÇÃO (Mude para 'ADMINISTRADOR' para testar a visão do Admin)
  const currentUser = { cargo: 'FUNCIONARIO' }

  const [classeFiltro, setClasseFiltro] = useState('Todos')
  const [search, setSearch] = useState('')
  const [defectList, setDefectList] = useState([])
  const [availableClasses, setAvailableClasses] = useState(['Todos'])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const params = classeFiltro === 'Todos' ? undefined : { classe_defeito: classeFiltro }
        const data = await api.getDefeitos(params)
        setDefectList(data)
        if (classeFiltro === 'Todos') {
          setAvailableClasses([
            'Todos',
            ...Array.from(new Set(data.map(getClasseDefeito).filter(Boolean))).sort(),
          ])
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [classeFiltro])

  const filtered = defectList.filter(d => {
    const classeDefeito = getClasseDefeito(d)
    const matchSearch = search === '' ||
      String(d.id).includes(search) ||
      d.placa?.modelo_codigo?.toLowerCase().includes(search.toLowerCase()) ||
      classeDefeito.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  const metrics = [
    { label: 'Total de Defeitos',  value: isLoading ? '-' : defectList.length, color: 'border-t-amber' },
    { label: 'Confirmados',        value: isLoading ? '-' : defectList.filter(d => d.status_confirmacao === 'confirmado').length, color: 'border-t-success-text' },
    { label: 'Falsos Positivos',   value: isLoading ? '-' : defectList.filter(d => d.status_confirmacao === 'falso_positivo').length, color: 'border-t-critical-text' },
  ]

  async function updateStatus(defeitoId, statusConfirmacao) {
    const previous = defectList
    setDefectList(current => current.map(item => (
      item.id === defeitoId ? { ...item, status_confirmacao: statusConfirmacao } : item
    )))

    try {
      const updated = await api.atualizarDefeito({
        id: defeitoId,
        status_confirmacao: statusConfirmacao,
      })
      setDefectList(current => current.map(item => (item.id === defeitoId ? updated : item)))
    } catch {
      setDefectList(previous)
      setError('Erro ao atualizar status de confirmacao')
    }
  }

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
          
          {/* Oculta o botão de exportar para quem não for ADMIN */}
          {currentUser.cargo === 'ADMINISTRADOR' && (
            <button className="flex items-center gap-1.5 px-4 py-2 bg-amber text-black rounded-md font-mono text-xs font-semibold hover:bg-amber-600 transition-all duration-fast cursor-pointer">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M2 14l4-4m0 0l6-6M6 10l-2 2"/><path d="M8 2l6 6"/></svg>
              Exportar CSV
            </button>
          )}
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
            placeholder="Buscar por ID, placa ou defeito..."
            disabled={isLoading}
            className="bg-bg-card border border-border text-text-primary font-sans text-xs rounded-md px-3 py-2 w-64 placeholder:text-text-muted focus:border-amber outline-none transition-all duration-fast disabled:opacity-50"
          />
          <div className="flex gap-1.5 flex-wrap">
            {availableClasses.map(t => (
              <button
                key={t}
                onClick={() => setClasseFiltro(t)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-md font-mono text-xs border transition-all duration-fast cursor-pointer disabled:opacity-50 ${classeFiltro === t ? 'bg-amber text-black border-amber font-semibold' : 'border-border text-text-secondary hover:bg-bg-elevated'}`}
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
                {['ID', 'Modelo', 'Classe do Defeito', 'Placa ID', 'Confirmação', 'Tipo', 'Data/Hora'].map(h => (
                  <th key={h} className="font-mono text-2xs text-text-muted uppercase tracking-label px-3 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3 w-16 bg-bg-elevated animate-pulse rounded"></div></td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center font-mono text-xs text-critical-text">Erro ao carregar: {error}</td></tr>
              ) : filtered.length > 0 ? (
                filtered.map(d => (
                  <tr key={d.id} className="border-b border-border/30 last:border-0 hover:bg-bg-elevated transition-all duration-fast">
                    <td className="px-3 py-3 font-mono text-xs text-amber">{d.id}</td>
                    <td className="px-3 py-3 font-mono text-xs text-text-secondary">{d.placa?.modelo_codigo || '-'}</td>
                    <td className="px-3 py-3 text-xs text-text-primary">{getClasseDefeito(d)}</td>
                    <td className="px-3 py-3 text-xs text-text-secondary">{d.placa_id}</td>
                    <td className="px-3 py-3">
                      
                      {/* Lógica de permissão: ADMIN edita, FUNCIONÁRIO apenas lê */}
                      {currentUser.cargo === 'ADMINISTRADOR' ? (
                        <select
                          value={d.status_confirmacao || 'confirmado'}
                          onChange={event => updateStatus(d.id, event.target.value)}
                          className="bg-bg-elevated border border-border rounded px-2 py-1 font-mono text-[10px] text-text-primary outline-none focus:border-amber"
                          aria-label={`Confirmacao do defeito ${d.id}`}
                        >
                          <option value="confirmado">{getStatusLabel('confirmado')}</option>
                          <option value="falso_positivo">{getStatusLabel('falso_positivo')}</option>
                        </select>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-bg-elevated border border-border rounded px-2 py-1 font-mono text-[10px] text-text-muted cursor-not-allowed">
                          {getStatusLabel(d.status_confirmacao || 'confirmado')}
                          <span title="Apenas administradores podem validar defeitos">🔒</span>
                        </span>
                      )}

                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded border px-2 py-1 font-mono text-[10px] font-bold uppercase ${d.tipo === 'video' ? 'border-success-text/40 text-success-text bg-success-text/10' : 'border-neutral-text/40 text-neutral-text bg-bg-elevated'}`}>
                        {d.tipo || 'imagem'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-text-muted">{d.data_hora ? new Date(d.data_hora).toLocaleString('pt-BR') : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="px-3 py-8 text-center font-mono text-xs text-text-muted">Nenhum defeito encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
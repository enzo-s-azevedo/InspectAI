'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { api } from '@/services/api'
import { toast } from 'sonner'

export default function RelatoriosPage() {
  const [relatorios, setRelatorios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => { loadRelatorios() }, [])

  async function loadRelatorios() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getRelatorios()
      setRelatorios(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

 async function handleDownloadPDF(id) {
    setDownloadingId(id)
    try {
      // 1. Pegamos o "crachá" (token) do usuário logado
      const user = JSON.parse(localStorage.getItem('inspectai_user') || '{}')

      // 2. Mandamos a requisição levando o token no cabeçalho
      const res = await fetch(`/backend-api/relatorios/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })

      // 3. Se o backend xingar, a gente pega o motivo exato
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro do servidor: ${res.status}`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF gerado com sucesso!')
    } catch (err) {
      toast.error(`Erro: ${err.message}`)
    } finally {
      setDownloadingId(null)
    }
  }

  const metrics = [
    { label: 'Total',      value: isLoading ? '-' : relatorios.length,                                                                      color: 'border-t-amber'        },
    { label: 'Defeitos',   value: isLoading ? '-' : relatorios.reduce((acc, r) => acc + (r.defeitos?.length || 0), 0),                       color: 'border-t-critical-text' },
    { label: 'Imagens',    value: isLoading ? '-' : relatorios.reduce((acc, r) => acc + (r.imagens?.length || 0), 0),                        color: 'border-t-success-text'  },
  ]

  return (
    <AppShell breadcrumb="/ Relatórios">
      <div className="p-6 flex flex-col gap-5">

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Relatórios de Inspeção</h1>
            <p className="font-mono text-2xs text-text-muted mt-1">
              // {isLoading ? 'Carregando...' : `${relatorios.length} relatórios gerados`}
            </p>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3">
          {metrics.map(m => (
            <div key={m.label} className={`bg-bg-card border border-border rounded-xl p-4 border-t-2 ${m.color}`}>
              <p className="font-mono text-2xs text-text-muted uppercase tracking-label mb-2">{m.label}</p>
              {isLoading ? <div className="h-8 w-16 bg-bg-elevated animate-pulse rounded mt-1" /> : <p className="font-mono text-3xl font-semibold">{m.value}</p>}
            </div>
          ))}
        </div>

        {/* Lista */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-bg-card border border-border rounded-xl p-5 animate-pulse">
                <div className="h-4 w-48 bg-bg-elevated rounded mb-3" />
                <div className="h-3 w-32 bg-bg-elevated rounded" />
              </div>
            ))
          ) : error ? (
            <div className="bg-bg-card border border-critical-border rounded-xl p-5 text-center font-mono text-xs text-critical-text">
              Erro ao carregar: {error}
            </div>
          ) : relatorios.length === 0 ? (
            <div className="bg-bg-card border border-border rounded-xl p-10 text-center font-mono text-xs text-text-muted">
              Nenhum relatório encontrado.
            </div>
          ) : (
            relatorios.map(r => {
              const confirmados = r.defeitos?.filter(d => d.defeito?.statusConfirmacao === 'confirmado').length || 0
              const falsos = r.defeitos?.filter(d => d.defeito?.statusConfirmacao === 'falso_positivo').length || 0
              const porClasse = (r.defeitos || []).reduce((acc, rd) => {
                const classe = rd.defeito?.classeDefeito || 'Sem classe'
                acc[classe] = (acc[classe] || 0) + 1
                return acc
              }, {})

              return (
                <div key={r.id} className="bg-bg-card border border-border rounded-xl p-5 hover:border-amber/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-amber font-bold">REL-{String(r.id).padStart(3, '0')}</span>
                        <span className="font-mono text-2xs text-text-muted">·</span>
                        <span className="font-mono text-2xs text-text-muted">{new Date(r.criadoEm).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="text-sm font-medium text-text-primary">
                        Modelo: {r.placa?.modeloCodigo || '-'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadPDF(r.id)}
                      disabled={downloadingId === r.id}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-mono text-xs font-semibold transition-all cursor-pointer ${downloadingId === r.id ? 'bg-amber/30 text-amber cursor-wait' : 'bg-amber text-black hover:bg-amber-600'}`}
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path d="M8 2v8M5 7l3 3 3-3M2 12h12"/>
                      </svg>
                      {downloadingId === r.id ? 'Gerando...' : 'Baixar PDF'}
                    </button>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Responsável',   value: r.usuarioCriador?.nome || '-'    },
                      { label: 'Imagens',        value: r.imagens?.length || 0           },
                      { label: 'Confirmados',    value: confirmados                      },
                      { label: 'Falsos Pos.',    value: falsos                           },
                    ].map(item => (
                      <div key={item.label} className="bg-bg-elevated rounded-lg p-3">
                        <p className="font-mono text-2xs text-text-muted uppercase mb-1">{item.label}</p>
                        <p className="font-mono text-sm font-semibold text-text-primary">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Por categoria */}
                  {Object.keys(porClasse).length > 0 && (
                    <div>
                      <p className="font-mono text-2xs text-text-muted uppercase tracking-label mb-2">Defeitos por categoria</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(porClasse).map(([classe, count]) => (
                          <span key={classe} className="font-mono text-[10px] bg-bg-elevated border border-border px-2 py-1 rounded text-text-secondary">
                            {classe}: <span className="text-amber font-bold">{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {r.usuarioUltimoAcesso && (
                    <p className="font-mono text-2xs text-text-muted mt-3">
                      Última modificação por <span className="text-text-secondary">{r.usuarioUltimoAcesso.nome}</span>
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </AppShell>
  )
}

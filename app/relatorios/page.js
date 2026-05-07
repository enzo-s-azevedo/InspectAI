'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import Badge from '@/components/Badge'
import { api } from '@/services/api'
import { toast } from 'sonner'

function getStatusVariant(status) {
  if (status === 'finalizado') return 'success'
  if (status === 'rascunho') return 'neutral'
  if (status === 'arquivado') return 'info'
  return 'neutral'
}

function getStatusLabel(status) {
  const map = { finalizado: 'Finalizado', rascunho: 'Rascunho', arquivado: 'Arquivado' }
  return map[status] || status
}

export default function RelatoriosPage() {
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingTitulo, setEditingTitulo] = useState('')
  
  // Ajuste: Adicionado 'descricao' e mudado 'origem' padrão para 'inspecao'
  const [form, setForm] = useState({ 
    titulo: '', 
    descricao: '', 
    origem: 'inspecao' 
  })

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getRelatorios()
      setReports(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate() {
    // Validação simples antes de enviar
    if (!form.titulo || !form.descricao) {
      toast.error('Preencha o título e a descrição')
      return
    }

    try {
      await api.criarRelatorio(form)
      toast.success('Relatório criado com sucesso!')
      setGenerating(false)
      // Reseta o formulário para os padrões corretos
      setForm({ titulo: '', descricao: '', origem: 'inspecao' })
      loadReports()
    } catch (err) {
      toast.error(`Erro: ${err.message}`)
    }
  }

  function handleStartEdit(r) {
    setEditingId(r.id)
    setEditingTitulo(r.titulo)
  }

  function handleSaveEdit(id) {
    setReports(prev => prev.map(r => r.id === id ? { ...r, titulo: editingTitulo } : r))
    setEditingId(null)
    toast.success('Título atualizado!')
  }

  function handleDelete(id) {
    setReports(prev => prev.filter(r => r.id !== id))
    toast.success('Relatório excluído.')
  }

  return (
    <AppShell breadcrumb="/ Relatórios">
      <div className="p-6 flex flex-col gap-5">

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Relatórios</h1>
            <p className="font-mono text-2xs text-text-muted mt-1">
              // {isLoading ? 'Carregando...' : `${reports.length} relatórios`}
            </p>
          </div>
          <button
            onClick={() => setGenerating(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber text-black rounded-md font-mono text-xs font-semibold hover:bg-amber-600 transition-all duration-fast cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
            Novo Relatório
          </button>
        </div>

        {generating && (
          <div className="bg-bg-card border border-amber/30 rounded-xl p-5 shadow-lg">
            <h2 className="font-mono text-xs text-text-secondary uppercase tracking-label mb-4">Configurar Relatório</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="font-mono text-2xs text-text-muted uppercase tracking-label block mb-1.5">Título</label>
                <input
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ex: Inspeção Lote B-047"
                  className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-xs rounded-md px-3 py-2 outline-none focus:border-amber placeholder:text-text-muted transition-all duration-fast"
                />
              </div>

              {/* NOVO CAMPO: Descrição */}
              <div>
                <label className="font-mono text-2xs text-text-muted uppercase tracking-label block mb-1.5">Descrição</label>
                <input
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Análise de qualidade de abril"
                  className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-xs rounded-md px-3 py-2 outline-none focus:border-amber placeholder:text-text-muted transition-all duration-fast"
                />
              </div>

              <div>
                <label className="font-mono text-2xs text-text-muted uppercase tracking-label block mb-1.5">Origem</label>
                <select
                  value={form.origem}
                  onChange={e => setForm({ ...form, origem: e.target.value })}
                  className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-xs rounded-md px-3 py-2 outline-none focus:border-amber transition-all duration-fast cursor-pointer"
                >
                  <option value="inspecao">Inspeção</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="px-4 py-2 bg-amber text-black rounded-md font-mono text-xs font-semibold hover:bg-amber-600 transition-all duration-fast cursor-pointer">Gerar</button>
              <button onClick={() => setGenerating(false)} className="px-4 py-2 border border-border text-text-secondary rounded-md font-mono text-xs hover:bg-bg-elevated transition-all duration-fast cursor-pointer">Cancelar</button>
            </div>
          </div>
        )}

        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3.5 border-b border-border/50">
            <span className="font-mono text-xs text-text-secondary uppercase tracking-label">Histórico</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {['Código', 'Título', 'Origem', 'Status', 'Data/Hora', 'Ações'].map(h => (
                  <th key={h} className="font-mono text-2xs text-text-muted uppercase tracking-label px-3 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3 w-20 bg-bg-elevated animate-pulse rounded"></div></td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan={6} className="px-3 py-8 text-center font-mono text-xs text-critical-text">Erro: {error}</td></tr>
              ) : reports.map(r => (
                <tr key={r.id} className="border-b border-border/30 last:border-0 hover:bg-bg-elevated transition-all duration-fast">
                  <td className="px-3 py-3 font-mono text-xs text-amber">{r.codigoInterno}</td>
                  <td className="px-3 py-3 text-xs text-text-primary font-medium">
                    {editingId === r.id ? (
                      <input value={editingTitulo} onChange={e => setEditingTitulo(e.target.value)} className="bg-bg-elevated border border-amber text-text-primary font-sans text-xs rounded px-2 py-1 outline-none w-full" autoFocus />
                    ) : r.titulo}
                  </td>
                  <td className="px-3 py-3 text-xs text-text-secondary capitalize">{r.origem}</td>
                  <td className="px-3 py-3"><Badge variant={getStatusVariant(r.status)}>{getStatusLabel(r.status)}</Badge></td>
                  <td className="px-3 py-3 font-mono text-xs text-text-muted">{new Date(r.criado).toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-3 items-center">
                      {editingId === r.id ? (
                        <button onClick={() => handleSaveEdit(r.id)} className="font-mono text-2xs text-success-text hover:underline cursor-pointer">Salvar</button>
                      ) : (
                        <button onClick={() => handleStartEdit(r)} className="font-mono text-2xs text-text-secondary hover:underline cursor-pointer">Editar</button>
                      )}
                      <button onClick={() => handleDelete(r.id)} className="font-mono text-2xs text-critical-text hover:underline cursor-pointer">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !error && reports.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center font-mono text-xs text-text-muted">Nenhum relatório encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
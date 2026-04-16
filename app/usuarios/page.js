'use client'

import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/AppShell'
import Badge from '@/components/Badge'
import { api } from '@/services/api'
import { toast } from 'sonner'

const permissions = [
  { key: 'visualizar', label: 'Visualizar defeitos' },
  { key: 'editar',     label: 'Editar registros'    },
  { key: 'validar',    label: 'Validar detecções'   },
  { key: 'relatorio',  label: 'Gerar relatórios'    },
  { key: 'usuarios',   label: 'Gerenciar usuários'  },
]

export default function UsuariosPage() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', papel: 'funcionario' })

  const userCountLabel = useMemo(() => `${users.length} usuários cadastrados`, [users.length])

  const loadUsuarios = async () => {
    try {
      setIsLoading(true)
      const data = await api.getUsuarios()
      setUsers(data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsuarios()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await api.createUsuario(form)
      toast.success('Usuário criado com sucesso')
      setForm({ nome: '', email: '', papel: 'funcionario' })
      setShowForm(false)
      await loadUsuarios()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const mapStatus = (status) => {
    if (status === 'ativo') return { variant: 'success', label: 'Ativo' }
    if (status === 'inativo') return { variant: 'neutral', label: 'Inativo' }
    return { variant: 'warning', label: status }
  }

  const initials = (nome) =>
    String(nome || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item[0])
      .join('')
      .toUpperCase()

  return (
    <AppShell breadcrumb="/ Usuários">
      <div className="p-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Usuários</h1>
            <p className="font-mono text-2xs text-text-muted mt-1">// {userCountLabel}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber text-black rounded-md font-mono text-xs font-semibold hover:bg-amber-600 transition-all duration-fast cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
            Novo Usuário
          </button>
        </div>

        {/* New user form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-bg-card border border-amber/30 rounded-xl p-5">
            <h2 className="font-mono text-xs text-text-secondary uppercase tracking-label mb-4">Cadastrar Usuário</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-mono text-2xs text-text-muted uppercase tracking-label block mb-1.5">Nome completo</label>
                <input
                  value={form.nome}
                  onChange={(event) => setForm((previous) => ({ ...previous, nome: event.target.value }))}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-xs rounded-md px-3 py-2 outline-none focus:border-amber placeholder:text-text-muted transition-all duration-fast"
                />
              </div>
              <div>
                <label className="font-mono text-2xs text-text-muted uppercase tracking-label block mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
                  placeholder="joao@inspect.ai"
                  className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-xs rounded-md px-3 py-2 outline-none focus:border-amber placeholder:text-text-muted transition-all duration-fast"
                />
              </div>
              <div>
                <label className="font-mono text-2xs text-text-muted uppercase tracking-label block mb-1.5">Papel</label>
                <select
                  value={form.papel}
                  onChange={(event) => setForm((previous) => ({ ...previous, papel: event.target.value }))}
                  className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-xs rounded-md px-3 py-2 outline-none focus:border-amber transition-all duration-fast"
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="admin">Administrador</option>
                  <option value="inspetor">Inspetor</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="font-mono text-2xs text-text-muted uppercase tracking-label block mb-2">Permissões</label>
              <div className="flex flex-wrap gap-2">
                {permissions.map(p => (
                  <label key={p.key} className="flex items-center gap-1.5 bg-bg-elevated border border-border rounded-md px-3 py-1.5 cursor-pointer hover:border-amber transition-all duration-fast">
                    <input type="checkbox" className="accent-amber" />
                    <span className="font-mono text-xs text-text-secondary">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-amber text-black rounded-md font-mono text-xs font-semibold hover:bg-amber-600 transition-all duration-fast cursor-pointer">
                Salvar
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border text-text-secondary rounded-md font-mono text-xs hover:bg-bg-elevated transition-all duration-fast cursor-pointer">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Users table */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {['Usuário', 'E-mail', 'Papel', 'Status', 'Cadastrado em', 'Ações'].map(h => (
                  <th key={h} className="font-mono text-2xs text-text-muted uppercase tracking-label px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!isLoading && users.map(u => {
                const status = mapStatus(u.status)
                return (
                <tr key={u.id} className="border-b border-border/30 last:border-0 hover:bg-bg-elevated transition-all duration-fast">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center font-mono text-xs font-semibold text-amber flex-shrink-0">
                        {u.avatar || initials(u.nome)}
                      </div>
                      <span className="text-xs font-medium text-text-primary">{u.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">{u.email}</td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{u.papel}</td>
                  <td className="px-4 py-3"><Badge variant={status.variant}>{status.label}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{new Date(u.criado).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button className="font-mono text-2xs text-amber hover:underline cursor-pointer">Editar</button>
                      <button className="font-mono text-2xs text-critical-text hover:underline cursor-pointer">Remover</button>
                    </div>
                  </td>
                </tr>
              )})}
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted text-xs font-mono uppercase">
                    Carregando usuarios...
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

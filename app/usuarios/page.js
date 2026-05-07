'use client'

import { useState, useEffect } from 'react'
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

function getStatusVariant(status) {
  return status === 'ativo' ? 'success' : 'neutral'
}

function getStatusLabel(status) {
  return status === 'ativo' ? 'Ativo' : 'Inativo'
}

function getAvatar(nome) {
  return nome?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
}

export default function UsuariosPage() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', papel: 'funcionario' })

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getUsuarios()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate() {
    try {
      await api.criarUsuario(form)
      toast.success('Usuário criado com sucesso!')
      setShowForm(false)
      setForm({ nome: '', email: '', papel: 'funcionario' })
      loadUsers()
    } catch (err) {
      toast.error(`Erro: ${err.message}`)
    }
  }

  async function handleDelete(id, nome) {
    try {
      await api.deletarUsuario(id)
      toast.success(`Usuário ${nome} removido.`)
      loadUsers()
    } catch (err) {
      toast.error(`Erro: ${err.message}`)
    }
  }

  return (
    <AppShell breadcrumb="/ Usuários">
      <div className="p-6 flex flex-col gap-5">

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Usuários</h1>
            <p className="font-mono text-2xs text-text-muted mt-1">
              // {isLoading ? 'Carregando...' : `${users.length} usuários cadastrados`}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber text-black rounded-md font-mono text-xs font-semibold hover:bg-amber-600 transition-all duration-fast cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
            Novo Usuário
          </button>
        </div>

        {showForm && (
          <div className="bg-bg-card border border-amber/30 rounded-xl p-5">
            <h2 className="font-mono text-xs text-text-secondary uppercase tracking-label mb-4">Cadastrar Usuário</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-mono text-2xs text-text-muted uppercase tracking-label block mb-1.5">Nome completo</label>
                <input
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-xs rounded-md px-3 py-2 outline-none focus:border-amber placeholder:text-text-muted transition-all duration-fast"
                />
              </div>
              <div>
                <label className="font-mono text-2xs text-text-muted uppercase tracking-label block mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="joao@inspect.ai"
                  className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-xs rounded-md px-3 py-2 outline-none focus:border-amber placeholder:text-text-muted transition-all duration-fast"
                />
              </div>
              <div>
                <label className="font-mono text-2xs text-text-muted uppercase tracking-label block mb-1.5">Papel</label>
                <select
                  value={form.papel}
                  onChange={e => setForm({ ...form, papel: e.target.value })}
                  className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-xs rounded-md px-3 py-2 outline-none focus:border-amber transition-all duration-fast"
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="admin">Administrador</option>
                  <option value="inspetor">Inspetor</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="px-4 py-2 bg-amber text-black rounded-md font-mono text-xs font-semibold hover:bg-amber-600 transition-all duration-fast cursor-pointer">
                Salvar
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border text-text-secondary rounded-md font-mono text-xs hover:bg-bg-elevated transition-all duration-fast cursor-pointer">
                Cancelar
              </button>
            </div>
          </div>
        )}

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
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 w-20 bg-bg-elevated animate-pulse rounded"></div></td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center font-mono text-xs text-critical-text">Erro ao carregar: {error}</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-border/30 last:border-0 hover:bg-bg-elevated transition-all duration-fast">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center font-mono text-xs font-semibold text-amber flex-shrink-0">
                          {getAvatar(u.nome)}
                        </div>
                        <span className="text-xs font-medium text-text-primary">{u.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{u.email}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary capitalize">{u.papel}</td>
                    <td className="px-4 py-3"><Badge variant={getStatusVariant(u.status)}>{getStatusLabel(u.status)}</Badge></td>
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">{new Date(u.criado).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => handleDelete(u.id, u.nome)} className="font-mono text-2xs text-critical-text hover:underline cursor-pointer">Remover</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
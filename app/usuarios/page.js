'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { api } from '@/services/api'
import { toast } from 'sonner'

function getAvatar(nome) {
  return nome?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
}

export default function UsuariosPage() {

  const router = useRouter()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', cargo: 'FUNCIONARIO' })
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // 1. Busca os dados do usuário salvos no login
    const userJson = localStorage.getItem('inspectai_user')
    const user = userJson ? JSON.parse(userJson) : null

    // 2. A Barreira de Segurança
    if (!user || user.cargo !== 'ADMINISTRADOR') {
      router.push('/') // Expulsa para a tela inicial
    } else {
      setIsAuthorized(true) // Libera a renderização da tela
      loadUsers() // Só agora ele vai na API buscar a lista
    }
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

  async function handleSubmit() {
    try {
      if (editingUser) {
        await api.editarUsuario(editingUser.id, form)
        toast.success('Usuário atualizado!')
      } else {
        await api.criarUsuario(form)
        toast.success('Usuário criado!')
      }
      setShowForm(false)
      setEditingUser(null)
      setForm({ nome: '', email: '', senha: '', cargo: 'FUNCIONARIO' })
      loadUsers()
    } catch (err) {
      toast.error(`Erro: ${err.message}`)
    }
  }

  function handleEdit(user) {
    setEditingUser(user)
    setForm({ nome: user.nome, email: user.email, senha: '', cargo: user.cargo })
    setShowForm(true)
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

  if (!isAuthorized) return null;
  return (
    <AppShell breadcrumb="/ Usuários">
      <div className="p-6 flex flex-col gap-5">

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">Gerenciamento de Usuários</h1>
            <p className="font-mono text-sm text-text-muted mt-1">
              // {isLoading ? 'Carregando...' : `${users.length} usuários cadastrados`}
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingUser(null); setForm({ nome: '', email: '', senha: '', cargo: 'FUNCIONARIO' }) }}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber text-black rounded-md font-mono text-sm font-semibold hover:bg-amber-600 transition-all duration-fast cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
            Novo Usuário
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',           value: isLoading ? '-' : users.length,                                           color: 'border-t-amber'         },
            { label: 'Administradores', value: isLoading ? '-' : users.filter(u => u.cargo === 'ADMINISTRADOR').length,  color: 'border-t-critical-text' },
            { label: 'Funcionários',    value: isLoading ? '-' : users.filter(u => u.cargo === 'FUNCIONARIO').length,    color: 'border-t-success-text'  },
          ].map(m => (
            <div key={m.label} className={`bg-bg-card border border-border rounded-xl p-4 border-t-2 ${m.color}`}>
              <p className="font-mono text-xs text-text-muted uppercase tracking-label mb-2">{m.label}</p>
              {isLoading ? <div className="h-8 w-16 bg-bg-elevated animate-pulse rounded mt-1" /> : <p className="font-mono text-3xl font-semibold">{m.value}</p>}
            </div>
          ))}
        </div>

        {showForm && (
          <div className="bg-bg-card border border-amber/30 rounded-xl p-5">
            <h2 className="font-mono text-sm text-text-secondary uppercase tracking-label mb-4">
              {editingUser ? `Editando: ${editingUser.nome}` : 'Novo Usuário'}
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-mono text-xs text-text-muted uppercase tracking-label block mb-1.5">Nome completo</label>
                <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: João da Silva" className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-sm rounded-md px-3 py-2 outline-none focus:border-amber placeholder:text-text-muted transition-all" />
              </div>
              <div>
                <label className="font-mono text-xs text-text-muted uppercase tracking-label block mb-1.5">E-mail</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="joao@inspectai.com" className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-sm rounded-md px-3 py-2 outline-none focus:border-amber placeholder:text-text-muted transition-all" />
              </div>
              <div>
                <label className="font-mono text-xs text-text-muted uppercase tracking-label block mb-1.5">{editingUser ? 'Nova senha (deixe em branco para manter)' : 'Senha'}</label>
                <input type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="••••••••" className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-sm rounded-md px-3 py-2 outline-none focus:border-amber placeholder:text-text-muted transition-all" />
              </div>
              <div>
                <label className="font-mono text-xs text-text-muted uppercase tracking-label block mb-1.5">Cargo</label>
                <select value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} className="w-full bg-bg-elevated border border-border text-text-primary font-sans text-sm rounded-md px-3 py-2 outline-none focus:border-amber transition-all">
                  <option value="ADMINISTRADOR">Administrador</option>
                  <option value="FUNCIONARIO">Funcionário</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSubmit} className="px-4 py-2 bg-amber text-black rounded-md font-mono text-sm font-semibold hover:bg-amber-600 transition-all cursor-pointer">{editingUser ? 'Salvar alterações' : 'Criar usuário'}</button>
              <button onClick={() => { setShowForm(false); setEditingUser(null) }} className="px-4 py-2 border border-border text-text-secondary rounded-md font-mono text-sm hover:bg-bg-elevated transition-all cursor-pointer">Cancelar</button>
            </div>
          </div>
        )}

        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {['Usuário', 'E-mail', 'Cargo', 'Permissões efetivas', 'Cadastrado em', 'Ações'].map(h => (
                  <th key={h} className="font-mono text-xs text-text-muted uppercase tracking-label px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 w-20 bg-bg-elevated animate-pulse rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center font-mono text-sm text-critical-text">Erro: {error}</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center font-mono text-sm text-text-muted">Nenhum usuário encontrado.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-border/30 last:border-0 hover:bg-bg-elevated transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-bg-elevated border border-border flex items-center justify-center font-mono text-sm font-semibold text-amber flex-shrink-0">{getAvatar(u.nome)}</div>
                        <span className="text-sm font-medium text-text-primary">{u.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-text-secondary">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded font-mono text-xs font-bold uppercase border ${u.cargo === 'ADMINISTRADOR' ? 'border-critical-text/40 text-critical-text bg-critical-text/10' : 'border-success-text/40 text-success-text bg-success-text/10'}`}>
                        {u.cargo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <span className="font-mono text-xs bg-bg-elevated border border-border px-1.5 py-0.5 rounded text-text-secondary">Defeitos</span>
                        {u.cargo === 'ADMINISTRADOR' ? (
                          <>
                            <span className="font-mono text-xs bg-bg-elevated border border-border px-1.5 py-0.5 rounded text-text-secondary">Relatórios</span>
                            <span className="font-mono text-xs bg-bg-elevated border border-border px-1.5 py-0.5 rounded text-text-secondary">Usuários</span>
                            <span className="font-mono text-xs bg-bg-elevated border border-border px-1.5 py-0.5 rounded text-text-secondary">Admin</span>
                          </>
                        ) : (
                          <>
                            <span className="font-mono text-xs bg-bg-elevated border border-amber/20 px-1.5 py-0.5 rounded text-text-muted line-through">Relatórios</span>
                            <span className="font-mono text-xs bg-bg-elevated border border-amber/20 px-1.5 py-0.5 rounded text-text-muted line-through">Admin</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-text-muted">{new Date(u.criadoEm).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => handleEdit(u)} className="font-mono text-sm text-amber hover:underline cursor-pointer">Editar</button>
                        <button onClick={() => handleDelete(u.id, u.nome)} className="font-mono text-sm text-critical-text hover:underline cursor-pointer">Remover</button>
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
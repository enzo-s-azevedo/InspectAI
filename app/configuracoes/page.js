'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { getUsuarioLogado, isAdministrador } from '@/lib/permissions'

export default function AdministracaoModelosPage() {
  const router = useRouter()
  const [models, setModels] = useState([])
  const [codigo, setCodigo] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)

  const totalPlacas = useMemo(() => models.reduce((acc, modelo) => acc + (Array.isArray(modelo.placas) ? modelo.placas.length : 0), 0), [models])

  const loadModels = async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await api.getModelos()
      setModels(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err.message || 'Erro ao carregar modelos'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const user = getUsuarioLogado()

    if (!isAdministrador(user?.cargo)) {
      router.push('/acesso-negado')
      return
    }

    setIsAuthorized(true)
    loadModels()
  }, [router])

  const handleCreate = async (event) => {
    event.preventDefault()

    const codigoModelo = codigo.trim()
    if (!codigoModelo) {
      toast.error('Informe o codigo do modelo')
      return
    }

    if (models.some((modelo) => modelo.codigo === codigoModelo)) {
      toast.error('Codigo de modelo ja existe')
      return
    }

    try {
      setIsSaving(true)
      const created = await api.criarModelo({ codigo: codigoModelo })
      setModels((current) => [created, ...current.filter((modelo) => modelo.codigo !== created.codigo)].sort((a, b) => a.codigo.localeCompare(b.codigo)))
      setCodigo('')
      toast.success('Modelo cadastrado com sucesso')
    } catch (err) {
      toast.error(err.message || 'Erro ao cadastrar modelo')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthorized) return null

  return (
    <AppShell breadcrumb="Controle / Modelos">
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Administração de modelos</h2>
          <p className="text-[9px] text-white/20 uppercase tracking-[0.35em] font-mono">Cadastro persistido diretamente na tabela modelo</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          <form onSubmit={handleCreate} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Novo modelo</p>
              <p className="text-[11px] text-white/40 font-mono">O codigo precisa ser unico e vai direto para o banco.</p>
            </div>

            <label className="block space-y-2">
              <span className="text-[10px] uppercase font-black text-white/60 tracking-widest">Codigo do modelo</span>
              <input
                value={codigo}
                onChange={(event) => setCodigo(event.target.value)}
                placeholder="PCB-A001-L1"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-fuchsia-500 transition-colors"
              />
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-fuchsia-500 text-black font-mono text-[10px] font-black uppercase rounded-xl hover:bg-fuchsia-400 disabled:opacity-50 transition-all"
            >
              {isSaving ? 'Salvando...' : 'Cadastrar modelo'}
            </button>

            <button
              type="button"
              onClick={loadModels}
              disabled={isLoading}
              className="w-full py-3 bg-white/5 border border-white/10 text-white font-mono text-[10px] font-black uppercase rounded-xl hover:border-fuchsia-500 transition-all disabled:opacity-50"
            >
              Atualizar listagem
            </button>

            <div className="pt-2 border-t border-white/10 space-y-1">
              <p className="text-[10px] uppercase font-black text-white/60 tracking-widest">Resumo</p>
              <p className="text-[11px] font-mono text-white/40">Modelos cadastrados: {isLoading ? '-' : models.length}</p>
              <p className="text-[11px] font-mono text-white/40">Placas vinculadas: {isLoading ? '-' : totalPlacas}</p>
              {error && <p className="text-[11px] font-mono text-red-300">{error}</p>}
            </div>
          </form>

          <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Modelos persistidos</p>
                <p className="text-[11px] text-white/40 font-mono">Listagem diretamente do banco de dados</p>
              </div>
              <p className="text-[10px] font-mono text-white/40 uppercase">{isLoading ? 'Carregando...' : `${models.length} registros`}</p>
            </div>

            <div className="divide-y divide-white/10">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="px-6 py-4 animate-pulse">
                    <div className="h-4 w-48 bg-white/10 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-white/10 rounded"></div>
                  </div>
                ))
              ) : models.length > 0 ? (
                models.map((modelo) => (
                  <div key={modelo.codigo} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors">
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">{modelo.codigo}</p>
                      <p className="text-[11px] text-white/35 font-mono">{Array.isArray(modelo.placas) ? modelo.placas.length : 0} placa(s) vinculada(s)</p>
                    </div>
                    <span className="px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 font-mono text-[10px] uppercase font-black">
                      modelo
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-white/50 font-mono uppercase">Nenhum modelo cadastrado</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

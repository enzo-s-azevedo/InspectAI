'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Apontando explicitamente para a porta 3001 onde o backend vive
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Bem-vindo, ${data.data.nome}!`)
        
        // 1. Salva os dados no navegador para o Menu/Dashboard usar
        localStorage.setItem('inspectai_user', JSON.stringify(data.data))
        
        // 2. RECRIANDO O COOKIE QUE O MIDDLEWARE EXIGE!
        // (Isso garante que o segurança libere a catraca)
        document.cookie = `inspectai_cargo=${data.data.cargo}; path=/; max-age=3600`
        
        // Se o seu backend também envia o token de segurança na resposta, salve ele também:
        if (data.token) {
           document.cookie = `inspectai_token=${data.token}; path=/; max-age=3600`
        }
        
        // 3. Força a ida para a tela principal
        window.location.href = '/'
      } else {
        toast.error(data.error || 'Credenciais inválidas. Tente novamente.')
      }
    } catch (error) {
      toast.error('Erro de conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
        
        <div className="w-16 h-16 bg-fuchsia-500/10 text-fuchsia-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(192,38,211,0.2)]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>

        <h1 className="text-2xl font-black uppercase italic tracking-tight mb-2">
          Login <span className="text-fuchsia-500">InspectAI</span>
        </h1>
        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mb-8 text-center">
          Bem-vindo! <br/> Insira suas credenciais
        </p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div>
            <input
              type="email"
              placeholder="E-MAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-4 bg-white/5 border border-white/10 text-white font-mono text-xs rounded-xl focus:outline-none focus:border-fuchsia-500 transition-all placeholder:text-white/30"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="SENHA"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full p-4 bg-white/5 border border-white/10 text-white font-mono text-xs rounded-xl focus:outline-none focus:border-fuchsia-500 transition-all placeholder:text-white/30"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-fuchsia-500 text-black font-mono text-xs font-black uppercase rounded-xl hover:bg-fuchsia-400 transition-all shadow-[0_0_15px_rgba(192,38,211,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}
'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function MockLoginPage() {
  const router = useRouter()

  const handleLogin = (cargo) => {
    // 1. Cria o cookie falso no navegador (Dura 1 hora)
    document.cookie = `inspectai_cargo=${cargo}; path=/; max-age=3600`
    
    // 2. Mostra a notificação
    toast.success(`Logado como ${cargo}`)
    
    // 3. Joga o usuário para a tela de Defeitos
    router.push('/defeitos')
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
          Ambiente de Teste (Mock) <br/> Aguardando task de Autenticação
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={() => handleLogin('ADMINISTRADOR')}
            className="w-full py-4 bg-fuchsia-500 text-black font-mono text-xs font-black uppercase rounded-xl hover:bg-fuchsia-400 transition-all shadow-[0_0_15px_rgba(192,38,211,0.3)] cursor-pointer"
          >
            Entrar como Administrador
          </button>

          <button 
            onClick={() => handleLogin('FUNCIONARIO')}
            className="w-full py-4 bg-white/5 border border-white/10 text-white font-mono text-xs font-black uppercase rounded-xl hover:border-amber hover:text-amber transition-all cursor-pointer"
          >
            Entrar como Funcionário
          </button>
        </div>

        <p className="mt-8 text-[9px] text-white/20 uppercase font-mono tracking-widest text-center leading-relaxed">
          Os botões acima geram um cookie local. <br/> 
          Use para testar o Middleware de rotas.
        </p>
      </div>
    </div>
  )
}
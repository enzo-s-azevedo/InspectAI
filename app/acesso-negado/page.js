'use client'

import Link from 'next/link'

export default function AcessoNegadoPage() {
  return (
    <main className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center p-6">
      <section className="w-full max-w-md border border-border bg-bg-panel rounded-xl p-8 text-center space-y-5">
        <div className="mx-auto w-12 h-12 rounded-lg border border-amber/30 bg-amber/10 text-amber flex items-center justify-center">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight">Acesso negado</h1>
          <p className="mt-2 text-sm text-text-muted">
            Seu perfil não possui permissão para acessar este recurso.
          </p>
        </div>
        <Link
          href="/defeitos"
          className="inline-flex items-center justify-center rounded-md bg-amber px-4 py-2 font-mono text-xs font-black uppercase text-black hover:bg-amber-600 transition-colors"
        >
          Voltar
        </Link>
      </section>
    </main>
  )
}

'use client'
import AppShell from '@/components/AppShell'

export default function DefeitosPage() {
  const defeitos = [
    { id: '#DEF-8312', componente: 'Resistor SMD', status: 'ERRO', data: '15/01/2026 14:51' },
    { id: '#DEF-0311', componente: 'Capacitor', status: 'FALSO POSITIVO', data: '15/01/2026 14:28' },
  ]

  return (
    <AppShell breadcrumb="Controle / Defeitos">
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">Total de Registros</p>
            <p className="text-2xl font-black text-white italic">248</p>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <p className="text-[9px] text-white/20 uppercase font-black tracking-widest text-red-500/50">Erros Confirmados</p>
            <p className="text-2xl font-black text-red-500 italic">212</p>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <p className="text-[9px] text-white/20 uppercase font-black tracking-widest text-fuchsia-500/50">Falsos Positivos</p>
            <p className="text-2xl font-black text-fuchsia-500 italic">36</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-white/[0.03] text-white/40 uppercase font-black tracking-tighter">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Componente</th>
                <th className="px-6 py-4">Status (ADM)</th>
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {defeitos.map((def) => (
                <tr key={def.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4 font-mono text-fuchsia-500">{def.id}</td>
                  <td className="px-6 py-4 text-white/80">{def.componente}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${def.status === 'ERRO' ? 'bg-red-500/10 text-red-500' : 'bg-fuchsia-500/10 text-fuchsia-500'}`}>
                      {def.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/40">{def.data}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-white/60 hover:text-fuchsia-500 uppercase font-black text-[9px]">Taxar Falso Positivo →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
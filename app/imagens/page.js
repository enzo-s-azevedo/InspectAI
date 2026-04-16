'use client'

import { useMemo, useState } from 'react'
import AppShell from '@/components/AppShell'
import { api } from '@/services/api'
import { toast } from 'sonner'

export default function InspecaoImagens() {
  const [imageFile, setImageFile] = useState(null)
  const [placaCodigo, setPlacaCodigo] = useState('PCB-AUTO-001')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [detections, setDetections] = useState([])
  const [savedDefeitos, setSavedDefeitos] = useState([])

  const selectedImageUrl = useMemo(() => {
    if (!imageFile) return null
    return URL.createObjectURL(imageFile)
  }, [imageFile])

  const runDetection = async () => {
    if (!imageFile) {
      toast.error('Selecione uma imagem antes de analisar')
      return
    }

    try {
      setIsAnalyzing(true)
      const result = await api.analisarImagem({ imageFile, placaCodigo })
      setDetections(Array.isArray(result.detections) ? result.detections : [])
      setSavedDefeitos(Array.isArray(result.savedDefeitos) ? result.savedDefeitos : [])
      toast.success('Analise concluida com sucesso')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <AppShell breadcrumb="Análise / Scanner de PCBs">
      <div className="p-6 h-[calc(100vh-48px)] flex flex-col gap-6 overflow-hidden relative">
        <div className="flex flex-wrap items-end justify-between gap-4 bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl shadow-xl shrink-0">
          <div className="flex flex-col gap-2 min-w-[280px]">
            <label className="text-[9px] text-white/30 uppercase font-mono">Imagem para analise</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              className="text-xs text-white/70 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 min-w-[220px]">
            <label className="text-[9px] text-white/30 uppercase font-mono">Codigo da placa</label>
            <input
              value={placaCodigo}
              onChange={(event) => setPlacaCodigo(event.target.value)}
              className="bg-white/5 border border-white/10 p-3 rounded text-[11px] outline-none focus:border-fuchsia-500 transition-colors font-mono text-fuchsia-400"
            />
          </div>

          <button
            onClick={runDetection}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-fuchsia-600 disabled:opacity-40 text-white font-mono text-[10px] font-black uppercase rounded-lg hover:bg-fuchsia-500 transition-all"
          >
            {isAnalyzing ? 'Analisando...' : 'Executar deteccao'}
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Imagem original</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 bg-black/40 min-h-0">
              {!selectedImageUrl && (
                <div className="text-white/20 text-[10px] uppercase font-mono">Aguardando upload de imagem</div>
              )}
              {selectedImageUrl && (
                <img src={selectedImageUrl} alt="Imagem para analise" className="max-h-full max-w-full object-contain rounded-lg border border-white/10" />
              )}
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Deteccoes da IA</span>
              <span className="text-[10px] font-mono text-fuchsia-500">{detections.length} itens</span>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {detections.length === 0 && (
                <div className="text-white/20 text-[10px] uppercase font-mono">Nenhuma deteccao ainda</div>
              )}
              {detections.map((detection, index) => (
                <div key={`${detection.label}-${index}`} className="p-3 bg-white/[0.02] border border-white/10 rounded-lg">
                  <p className="text-[11px] text-white font-black uppercase tracking-tight">{detection.label}</p>
                  <p className="text-[10px] text-white/40 font-mono">Confianca: {Math.round((detection.confidence || 0) * 100)}%</p>
                  <p className="text-[10px] text-white/40 font-mono">BBox: {JSON.stringify(detection.bbox || [])}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-white/5 p-6 rounded-2xl shadow-2xl shrink-0">
          <h3 className="text-sm font-black text-white uppercase italic mb-4">Defeitos persistidos</h3>
          <div className="grid md:grid-cols-2 gap-3 max-h-52 overflow-auto">
            {savedDefeitos.length === 0 && (
              <div className="text-[10px] font-mono uppercase text-white/30">Execute uma deteccao para salvar defeitos no banco</div>
            )}
            {savedDefeitos.map((defeito) => (
              <div key={defeito.id} className="border border-white/10 rounded-lg p-3 bg-white/[0.02]">
                <p className="text-[11px] text-fuchsia-400 font-mono">{defeito.codigoInterno}</p>
                <p className="text-[10px] text-white/80 uppercase font-black">{defeito.tipo}</p>
                <p className="text-[10px] text-white/40 font-mono">Placa: {defeito.placa?.codigo || '-'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

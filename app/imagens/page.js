'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { api } from '@/services/api'
import { toast } from 'sonner'

const DEFAULT_PLACA_CODIGO = 'PCB-AUTO-001'
const MODEL_PATH = 'runs/detect/train/weights/best.pt'

function formatConfidence(value) {
  const confidence = Number(value || 0)
  return confidence.toFixed(2)
}

function normalizeBBox(bbox) {
  if (!Array.isArray(bbox) || bbox.length < 4) return null

  const [x1, y1, x2, y2] = bbox.map((value) => Number(value || 0))
  if ([x1, y1, x2, y2].some((value) => Number.isNaN(value))) return null
  if (x2 <= x1 || y2 <= y1) return null

  return [x1, y1, x2, y2]
}

export default function InspecaoImagens() {
  const [imageFile, setImageFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [detections, setDetections] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [statusText, setStatusText] = useState('Aguardando imagem')
  const [errorText, setErrorText] = useState('')
  const [availableClasses, setAvailableClasses] = useState([])
  const [selectedClasses, setSelectedClasses] = useState([])

  const fileInputRef = useRef(null)
  const originalCanvasRef = useRef(null)
  const originalCanvasWrapperRef = useRef(null)
  const cropCanvasRef = useRef(null)
  const cropCanvasWrapperRef = useRef(null)
  const imageRef = useRef(null)

  const selectedImageUrl = useMemo(() => {
    if (!imageFile) return null
    return URL.createObjectURL(imageFile)
  }, [imageFile])

  const selectedDetection = useMemo(() => {
    if (!detections.length) return null
    return detections[selectedIndex] || null
  }, [detections, selectedIndex])

  const selectedClassesSet = useMemo(() => new Set(selectedClasses), [selectedClasses])

  useEffect(() => {
    return () => {
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl)
      }
    }
  }, [selectedImageUrl])

  useEffect(() => {
    const loadDefectClasses = async () => {
      try {
        const response = await fetch('/api/defect-classes', { cache: 'no-store' })
        const payload = await response.json()
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error?.message || 'Falha ao carregar classes de defeitos')
        }

        const classes = Array.isArray(payload?.data?.classes) ? payload.data.classes : []
        setAvailableClasses(classes)
      } catch (error) {
        toast.error(error.message)
      }
    }

    loadDefectClasses()
  }, [])

  useEffect(() => {
    if (!selectedImageUrl) {
      imageRef.current = null
      return undefined
    }

    let canceled = false
    const image = new window.Image()
    image.onload = () => {
      if (canceled) return
      imageRef.current = image
      drawOriginalCanvas()
      drawZoomCanvas()
    }
    image.src = selectedImageUrl

    return () => {
      canceled = true
    }
  }, [selectedImageUrl])

  const drawOriginalCanvas = useCallback(() => {
    const image = imageRef.current
    const canvas = originalCanvasRef.current
    const wrapper = originalCanvasWrapperRef.current
    if (!image || !canvas || !wrapper) return

    const context = canvas.getContext('2d')
    if (!context) return

    const targetWidth = Math.max(280, Math.floor(wrapper.clientWidth - 2))
    const maxHeight = 520
    const scale = Math.min(targetWidth / image.naturalWidth, maxHeight / image.naturalHeight)
    const drawWidth = Math.max(1, Math.floor(image.naturalWidth * scale))
    const drawHeight = Math.max(1, Math.floor(image.naturalHeight * scale))

    canvas.width = drawWidth
    canvas.height = drawHeight

    context.clearRect(0, 0, drawWidth, drawHeight)
    context.drawImage(image, 0, 0, drawWidth, drawHeight)

    const scaleX = drawWidth / image.naturalWidth
    const scaleY = drawHeight / image.naturalHeight

    detections.forEach((detection, index) => {
      const normalizedBBox = normalizeBBox(detection?.bbox)
      if (!normalizedBBox) return

      const [x1, y1, x2, y2] = normalizedBBox
      const selected = index === selectedIndex
      const color = selected ? '#9d5ff5' : '#f97316'
      const boxX = x1 * scaleX
      const boxY = y1 * scaleY
      const boxWidth = (x2 - x1) * scaleX
      const boxHeight = (y2 - y1) * scaleY

      context.strokeStyle = color
      context.lineWidth = selected ? 3 : 2
      context.strokeRect(boxX, boxY, boxWidth, boxHeight)

      const label = `${detection?.label || 'defeito'} ${formatConfidence(detection?.confidence)}`
      context.font = '600 12px "IBM Plex Mono", monospace'
      const textWidth = context.measureText(label).width
      const textX = boxX
      const textY = Math.max(14, boxY - 8)
      const padding = 6

      context.fillStyle = color
      context.fillRect(textX - 2, textY - 14, textWidth + padding, 18)
      context.fillStyle = '#0d0d0d'
      context.fillText(label, textX + 1, textY)
    })
  }, [detections, selectedIndex])

  const drawZoomCanvas = useCallback(() => {
    const image = imageRef.current
    const canvas = cropCanvasRef.current
    const wrapper = cropCanvasWrapperRef.current
    if (!canvas || !wrapper) return

    const context = canvas.getContext('2d')
    if (!context) return

    const width = Math.max(220, Math.floor(wrapper.clientWidth - 2))
    const height = 320
    canvas.width = width
    canvas.height = height
    context.clearRect(0, 0, width, height)

    if (!image || !selectedDetection) {
      context.fillStyle = '#0a0a0a'
      context.fillRect(0, 0, width, height)
      context.fillStyle = 'rgba(240,238,255,0.45)'
      context.font = '600 13px "IBM Plex Mono", monospace'
      context.textAlign = 'center'
      context.fillText('Nenhum defeito selecionado', width / 2, height / 2)
      context.textAlign = 'left'
      return
    }

    const normalizedBBox = normalizeBBox(selectedDetection.bbox)
    if (!normalizedBBox) return

    const [x1, y1, x2, y2] = normalizedBBox
    const sourceWidth = x2 - x1
    const sourceHeight = y2 - y1
    if (sourceWidth <= 0 || sourceHeight <= 0) return

    context.fillStyle = '#0a0a0a'
    context.fillRect(0, 0, width, height)

    const scale = Math.min(width / sourceWidth, height / sourceHeight)
    const drawWidth = sourceWidth * scale
    const drawHeight = sourceHeight * scale
    const offsetX = (width - drawWidth) / 2
    const offsetY = (height - drawHeight) / 2

    context.drawImage(image, x1, y1, sourceWidth, sourceHeight, offsetX, offsetY, drawWidth, drawHeight)
  }, [selectedDetection])

  useEffect(() => {
    drawOriginalCanvas()
    drawZoomCanvas()
  }, [drawOriginalCanvas, drawZoomCanvas])

  useEffect(() => {
    const handleResize = () => {
      drawOriginalCanvas()
      drawZoomCanvas()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawOriginalCanvas, drawZoomCanvas])

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const onImageChange = (event) => {
    const file = event.target.files?.[0] || null
    if (!file) return

    if (!String(file.type || '').startsWith('image/')) {
      toast.error('Selecione apenas uma imagem (.jpg, .jpeg, .png)')
      event.target.value = ''
      return
    }

    setImageFile(file)
    setDetections([])
    setSelectedIndex(0)
    setStatusText('Aguardando imagem')
    setErrorText('')
  }

  const toggleClass = (item) => {
    setSelectedClasses((current) => {
      if (current.includes(item)) return current.filter((value) => value !== item)
      return [...current, item]
    })
  }

  const selectAllClasses = () => {
    setSelectedClasses(availableClasses)
  }

  const clearSelectedClasses = () => {
    setSelectedClasses([])
  }

  const goToPrevDetection = () => {
    if (!detections.length) return
    setSelectedIndex((current) => (current - 1 + detections.length) % detections.length)
  }

  const goToNextDetection = () => {
    if (!detections.length) return
    setSelectedIndex((current) => (current + 1) % detections.length)
  }

  const runDetection = async () => {
    if (!imageFile) {
      toast.error('Selecione uma imagem antes de analisar')
      return
    }

    const classes = [...selectedClasses]
    if (classes.length === 0) {
      setErrorText('Selecione ao menos um defeito')
      setStatusText('Aguardando imagem')
      toast.error('Selecione ao menos um defeito')
      return
    }

    try {
      setIsAnalyzing(true)
      setErrorText('')
      setStatusText('Processando...')
      setDetections([])
      setSelectedIndex(0)

      const result = await api.analisarImagem({
        imageFile,
        placaCodigo: DEFAULT_PLACA_CODIGO,
        classes,
      })

      const nextDetections = Array.isArray(result.detections) ? result.detections : []
      setDetections(nextDetections)
      setSelectedIndex(0)
      setStatusText('Deteccao concluida')
      toast.success('Deteccao concluida com sucesso')
    } catch (error) {
      setStatusText('Aguardando imagem')
      toast.error(error.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <AppShell breadcrumb="Análise / Scanner de PCBs">
      <div className="p-6 h-[calc(100vh-48px)] flex flex-col gap-6 overflow-hidden relative">
        <span className="sr-only">Imagem para analise</span>
        <span className="sr-only">Codigo da placa</span>
        <span className="sr-only">Defeitos persistidos</span>
        <div className="flex flex-wrap items-center justify-between gap-3 bg-bg-panel border border-border p-4 rounded-2xl shadow-xl shrink-0">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={onImageChange}
              className="hidden"
            />
            <button
              onClick={handleSelectFile}
              className="px-4 py-2.5 bg-bg-elevated border border-border text-text-primary font-mono text-[10px] font-black uppercase rounded-lg hover:border-amber transition-all"
            >
              Carregar imagem
            </button>

            <button
              onClick={runDetection}
              disabled={isAnalyzing || !imageFile}
              className="px-4 py-2.5 bg-amber disabled:opacity-40 text-black font-mono text-[10px] font-black uppercase rounded-lg hover:bg-amber-600 transition-all"
            >
              {isAnalyzing ? 'Processando...' : 'Executar deteccao'}
            </button>
          </div>

          <div className="text-right min-w-[220px]">
            <p className="text-[9px] text-text-muted uppercase font-mono">Modelo carregado</p>
            <p className="text-[11px] text-text-primary font-mono">Modelo: {MODEL_PATH}</p>
          </div>
        </div>

        <div className="bg-bg-panel border border-border rounded-2xl p-4 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Selecao de componentes</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllClasses}
                className="px-3 py-2 bg-bg-elevated border border-border text-[10px] uppercase font-mono rounded hover:border-amber transition-colors"
              >
                Selecionar todos
              </button>
              <button
                type="button"
                onClick={clearSelectedClasses}
                className="px-3 py-2 bg-bg-elevated border border-border text-[10px] uppercase font-mono rounded hover:border-amber transition-colors"
              >
                Limpar selecao
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableClasses.map((className) => (
              <label key={className} className="flex items-center gap-2 text-[11px] font-mono text-text-primary border border-border rounded px-2 py-2 bg-bg-base/70">
                <input
                  type="checkbox"
                  checked={selectedClassesSet.has(className)}
                  onChange={() => toggleClass(className)}
                  className="accent-[var(--color-amber)]"
                />
                <span>{className}</span>
              </label>
            ))}

            {!availableClasses.length && (
              <p className="text-[10px] text-text-muted uppercase font-mono">Nenhuma classe disponivel em data.yaml</p>
            )}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          <div className="bg-bg-panel border border-border rounded-3xl flex flex-col overflow-hidden min-h-0">
            <div className="p-4 border-b border-border bg-bg-elevated/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Imagem original</span>
            </div>
            <div ref={originalCanvasWrapperRef} className="flex-1 flex items-center justify-center p-4 bg-black/40 min-h-0 overflow-auto">
              {!selectedImageUrl && <div className="text-text-muted text-[10px] uppercase font-mono">Aguardando imagem</div>}
              {selectedImageUrl && <canvas ref={originalCanvasRef} className="max-w-full rounded-lg border border-border" />}
            </div>
          </div>

          <div className="bg-bg-panel border border-border rounded-3xl flex flex-col overflow-hidden min-h-0">
            <div className="p-4 border-b border-border bg-bg-elevated/20 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Defeito ampliado</span>
              <span className="text-[10px] font-mono text-amber">{detections.length} itens</span>
            </div>
            <div ref={cropCanvasWrapperRef} className="flex-1 flex items-center justify-center p-4 bg-black/40 min-h-0 overflow-auto">
              <canvas ref={cropCanvasRef} className="max-w-full rounded-lg border border-border" />
            </div>

            <div className="p-4 border-t border-border bg-bg-base/60 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={detections.length < 2}
                onClick={goToPrevDetection}
                className="px-3 py-2 bg-bg-elevated border border-border text-[10px] uppercase font-mono rounded disabled:opacity-40 hover:border-amber transition-colors"
              >
                &lt; Defeito anterior
              </button>

              <div className="text-center">
                {selectedDetection ? (
                  <>
                    <p className="text-[10px] text-text-primary font-mono">Defeito {selectedIndex + 1} de {detections.length}</p>
                    <p className="text-[10px] text-text-secondary font-mono">Classe: {selectedDetection.label}</p>
                    <p className="text-[10px] text-text-secondary font-mono">Confianca: {formatConfidence(selectedDetection.confidence)}</p>
                  </>
                ) : (
                  <p className="text-[10px] text-text-muted font-mono">Nenhum defeito selecionado</p>
                )}
              </div>

              <button
                type="button"
                disabled={detections.length < 2}
                onClick={goToNextDetection}
                className="px-3 py-2 bg-bg-elevated border border-border text-[10px] uppercase font-mono rounded disabled:opacity-40 hover:border-amber transition-colors"
              >
                Proximo defeito &gt;
              </button>
            </div>
          </div>
        </div>

        <div className="bg-bg-panel border border-border p-4 rounded-2xl shadow-2xl shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary">Estado atual</p>
            <p className="text-[12px] font-mono text-text-primary">{statusText}</p>
            {errorText && <p className="text-[11px] font-mono text-red-400">{errorText}</p>}
          </div>

          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary">Quantidade de defeitos</p>
            <p className="text-[12px] font-mono text-amber">{detections.length} defeitos detectados</p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

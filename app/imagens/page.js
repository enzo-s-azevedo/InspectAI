'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import { api } from '@/services/api'
import { toast } from 'sonner'

const MODEL_PATH = 'runs/detect/train/weights/best.pt'
const BATCH_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png']

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

function normalizeDetectionClassificacao(detection) {
  const classificacao = String(detection?.classificacao || detection?.classification || '').trim()
  if (classificacao === 'real') return 'real'
  if (classificacao === 'falso_positivo') return 'falso_positivo'

  const status = String(detection?.status_confirmacao || detection?.statusConfirmacao || '').trim()
  return status === 'falso_positivo' ? 'falso_positivo' : 'real'
}

function decorateDetection(detection) {
  const classificacao = normalizeDetectionClassificacao(detection)
  return {
    ...detection,
    classificacao,
    status_confirmacao: classificacao === 'falso_positivo' ? 'falso_positivo' : 'confirmado',
  }
}

function getClassificacaoLabel(classificacao) {
  return classificacao === 'falso_positivo' ? 'Falso positivo' : 'Confirmado'
}

function isAllowedBatchImage(file) {
  const name = String(file?.name || '').toLowerCase()
  return BATCH_IMAGE_EXTENSIONS.some((extension) => name.endsWith(extension))
}

function createBatchItem(file, status = 'pendente', error = '') {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    name: file.name,
    size: file.size,
    file,
    status,
    error,
    detections: [],
    savedCount: 0,
  }
}

export default function InspecaoImagens() {
  const [imageFile, setImageFile] = useState(null)
  const [models, setModels] = useState([])
  const [selectedModelCodigo, setSelectedModelCodigo] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [detections, setDetections] = useState([])
  const [savedDetections, setSavedDetections] = useState([])
  const [savedPlaca, setSavedPlaca] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [statusText, setStatusText] = useState('Aguardando imagem ou lote')
  const [errorText, setErrorText] = useState('')
  const [availableClasses, setAvailableClasses] = useState([])
  const [fallbackClasses, setFallbackClasses] = useState([])
  const [selectedClasses, setSelectedClasses] = useState([])
  const [analysisMeta, setAnalysisMeta] = useState(null)
  const [activeTab, setActiveTab] = useState('individual')
  const [batchFiles, setBatchFiles] = useState([])
  const [batchQueue, setBatchQueue] = useState([])
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)
  const [batchReport, setBatchReport] = useState(null)
  const [batchSummary, setBatchSummary] = useState(null)

  const fileInputRef = useRef(null)
  const batchFolderInputRef = useRef(null)
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

  const detectionSummary = useMemo(() => {
    const falsos = detections.filter((item) => normalizeDetectionClassificacao(item) === 'falso_positivo').length
    return {
      reais: detections.length - falsos,
      falsos,
    }
  }, [detections])

  const batchProgress = useMemo(() => {
    if (!batchQueue.length) return 0
    const finished = batchQueue.filter((item) => item.status === 'processado' || item.status === 'erro').length
    return Math.round((finished / batchQueue.length) * 100)
  }, [batchQueue])

  useEffect(() => {
    return () => {
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl)
      }
    }
  }, [selectedImageUrl])

  useEffect(() => {
    const loadModels = async () => {
      try {
        const data = await api.getModelos()
        setModels(Array.isArray(data) ? data : [])
      } catch (error) {
        toast.error(error.message)
      }
    }

    const loadDefectClasses = async () => {
      try {
        const response = await fetch('/api/defect-classes', { cache: 'no-store' })
        const payload = await response.json()
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error?.message || 'Falha ao carregar classes de defeitos')
        }

        const classes = Array.isArray(payload?.data?.classes) ? payload.data.classes : []
        setFallbackClasses(classes)
        setAvailableClasses(classes)
        setSelectedClasses((current) => (current.length > 0 ? current : classes))
      } catch (error) {
        toast.error(error.message)
      }
    }

    loadModels()
    loadDefectClasses()
  }, [])

  useEffect(() => {
    const loadModelDefects = async () => {
      if (!selectedModelCodigo) {
        setAvailableClasses(fallbackClasses)
        setSelectedClasses((current) => (current.length > 0 ? current.filter((item) => fallbackClasses.includes(item)) : fallbackClasses))
        return
      }

      try {
        const defeitos = await api.getDefeitos({ modelo_codigo: selectedModelCodigo })
        const classesFromDb = Array.from(new Set(defeitos.map((item) => item?.classe_defeito).filter(Boolean))).sort()
        const nextClasses = classesFromDb.length > 0 ? classesFromDb : fallbackClasses
        setAvailableClasses(nextClasses)
        setSelectedClasses((current) => {
          const intersection = current.filter((item) => nextClasses.includes(item))
          return intersection.length > 0 ? intersection : nextClasses
        })
      } catch (error) {
        toast.error(error.message)
      }
    }

    loadModelDefects()
  }, [selectedModelCodigo, fallbackClasses])

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
      const isFalsePositive = normalizeDetectionClassificacao(detection) === 'falso_positivo'
      const color = isFalsePositive ? '#ef4444' : selected ? '#9d5ff5' : '#f97316'
      const boxX = x1 * scaleX
      const boxY = y1 * scaleY
      const boxWidth = (x2 - x1) * scaleX
      const boxHeight = (y2 - y1) * scaleY

      context.strokeStyle = color
      context.lineWidth = selected ? 3 : 2
      context.strokeRect(boxX, boxY, boxWidth, boxHeight)

      const label = `${detection?.label || 'defeito'} ${formatConfidence(detection?.confidence)} ${isFalsePositive ? 'FP' : 'CONF'}`
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
    if (activeTab === 'lote') {
      batchFolderInputRef.current?.click()
      return
    }

    fileInputRef.current?.click()
  }

  const onImageChange = (event) => {
    const files = Array.from(event.target.files || [])
    const file = files[0] || null
    if (!file) return

    if (files.length > 1 || !isAllowedBatchImage(file)) {
      toast.error('Selecione apenas uma imagem .jpg ou .png')
      event.target.value = ''
      return
    }

    setImageFile(file)
    setDetections([])
    setSelectedIndex(0)
    setStatusText('Imagem selecionada')
    setErrorText('')
  }

  const openBatchItemPreview = (item) => {
    if (!item?.file) return

    setActiveTab('individual')
    setImageFile(item.file)
    setDetections(Array.isArray(item.detections) ? item.detections.map(decorateDetection) : [])
    setSavedDetections([])
    setSavedPlaca(null)
    setAnalysisMeta({ inputType: 'imagem' })
    setSelectedIndex(0)
    setErrorText(item.status === 'erro' ? item.error || '' : '')
    setStatusText(item.status === 'processado' ? `Visualizando ${item.name}` : `Visualizando ${item.name} com erro`)
  }

  const handleBatchSelection = (event) => {
    const fileList = event.target.files
    const files = Array.from(fileList || [])

    if (files.length === 0) {
      toast.error('A pasta selecionada esta vazia')
    }

    setBatchFiles(files)
    setBatchQueue(files.map((file) => createBatchItem(file)))
    setBatchReport(null)
    setBatchSummary(null)
    setStatusText(
      files.length
        ? `${files.length} arquivo(s) selecionado(s)`
        : 'Aguardando imagens do lote'
    )
  }

  const clearBatch = () => {
    setBatchFiles([])
    setBatchQueue([])
    setBatchReport(null)
    setBatchSummary(null)
    setStatusText('Aguardando imagem ou lote')

    if (batchFolderInputRef.current) batchFolderInputRef.current.value = ''
  }

  const clearImage = () => {
    setImageFile(null)
    setDetections([])
    setSavedDetections([])
    setSavedPlaca(null)
    setAnalysisMeta(null)
    setSelectedIndex(0)
    setStatusText('Aguardando imagem ou lote')
    setErrorText('')
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const clearActiveSelection = () => {
    if (activeTab === 'lote') {
      clearBatch()
      return
    }

    clearImage()
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
      toast.error('Selecione uma imagem ou lote antes de analisar')
      return
    }

    if (!selectedModelCodigo || models.length === 0) {
      toast.error('Selecione um modelo de placa')
      return
    }

    const classesArray = [...selectedClasses]
    if (classesArray.length === 0) {
      setStatusText('Aguardando processamento')
      toast.error('Selecione ao menos um defeito')
      return
    }

    try {
      setIsAnalyzing(true)
      setErrorText('')
      setStatusText('Processando...')

      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('modelo_codigo', selectedModelCodigo)
      
      if (classesArray.length > 0) {
        formData.append('classes', JSON.stringify(classesArray))
      }

      const result = await api.analisarImagem(formData)

      const nextDetections = Array.isArray(result.detections) ? result.detections.map(decorateDetection) : []
      setDetections(nextDetections)
      setSavedDetections([])
      setSavedPlaca(null)
      setAnalysisMeta({ inputType: result.inputType || 'imagem' })
      setSelectedIndex(0)
      setStatusText(
        nextDetections.length > 0
          ? `Deteccao concluida. ${nextDetections.length} defeito(s) identificado(s)`
          : 'Deteccao concluida. Nenhum defeito identificado'
      )
      toast.success('Deteccao concluida com sucesso')
    } catch (error) {
      setStatusText('Falha na deteccao individual')
      setErrorText(error.message || 'Nao foi possivel processar a imagem')
      toast.error(error.message || 'Nao foi possivel processar a imagem')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveDetections = async () => {
    if (!selectedModelCodigo) {
      toast.error('Selecione um modelo antes de salvar')
      return
    }

    if (!detections.length) {
      toast.error('Nao ha deteccoes temporarias para salvar')
      return
    }

    try {
      setIsSaving(true)
      const normalizedDetections = detections.map(decorateDetection)
      const result = await api.salvarDeteccoes({
        modelo_codigo: selectedModelCodigo,
        detections: normalizedDetections,
        source_type: analysisMeta?.inputType || 'imagem',
      })

      const persisted = Array.isArray(result?.savedDefeitos) ? result.savedDefeitos : []
      setSavedDetections(persisted)
      setSavedPlaca(result?.placa || null)
      setStatusText(`Deteccoes salvas na placa ${result?.placa?.id || ''}`.trim())
      toast.success('Deteccoes salvas com sucesso')

      const defeitosAtualizados = await api.getDefeitos({ modelo_codigo: selectedModelCodigo })
      const classesAtualizadas = Array.from(new Set(defeitosAtualizados.map((item) => item?.classe_defeito).filter(Boolean))).sort()
      if (classesAtualizadas.length > 0) {
        setAvailableClasses(classesAtualizadas)
        setSelectedClasses((current) => {
          const intersection = current.filter((item) => classesAtualizadas.includes(item))
          return intersection.length > 0 ? intersection : classesAtualizadas
        })
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSelectedDetectionClassificacao = (classificacao) => {
    if (!selectedDetection) return

    const currentClassificacao = normalizeDetectionClassificacao(selectedDetection)
    const nextClassificacao = classificacao === currentClassificacao ? 'real' : classificacao

    setDetections((current) => current.map((item, index) => (
      index === selectedIndex
        ? decorateDetection({
            ...item,
            classificacao: nextClassificacao,
            status_confirmacao: nextClassificacao === 'falso_positivo' ? 'falso_positivo' : 'confirmado',
          })
        : item
    )))
    setSavedDetections([])
    setSavedPlaca(null)
  }

  const cancelDetections = () => {
    setDetections([])
    setSavedDetections([])
    setSavedPlaca(null)
    setAnalysisMeta(null)
    setSelectedIndex(0)
    setStatusText('Deteccoes temporarias descartadas')
    toast.info('Deteccoes descartadas')
  }

  const runBatchProcessing = async () => {
    if (!selectedModelCodigo || models.length === 0) {
      toast.error('Selecione um modelo de placa')
      return
    }

    if (batchFiles.length === 0) {
      toast.error('Selecione uma pasta com imagens .jpg ou .png para processar')
      setStatusText('Nenhuma imagem valida selecionada')
      return
    }

    const classesArray = [...selectedClasses]
    if (classesArray.length === 0) {
      toast.error('Selecione ao menos um defeito')
      return
    }

    try {
      setIsBatchProcessing(true)
      setErrorText('')
      setBatchReport(null)
      setBatchSummary(null)
      setStatusText('Processando lote...')
      setBatchQueue(batchFiles.map((file) => createBatchItem(file, 'processando')))

      const nextQueue = []
      for (const file of batchFiles) {
        if (!isAllowedBatchImage(file)) {
          nextQueue.push(createBatchItem(file, 'erro', 'Formato nao suportado. Use apenas .jpg ou .png'))
          continue
        }

        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('modelo_codigo', selectedModelCodigo)
          formData.append('classes', JSON.stringify(classesArray))

          const result = await api.analisarImagem(formData)
          const detectionsResult = Array.isArray(result?.detections) ? result.detections.map(decorateDetection) : []

          nextQueue.push({
            ...createBatchItem(file, 'processado', ''),
            detections: detectionsResult,
            savedCount: Array.isArray(result?.savedDefeitos) ? result.savedDefeitos.length : 0,
          })
        } catch (error) {
          nextQueue.push(createBatchItem(file, 'erro', error.message || 'Nao foi possivel processar a imagem'))
        }

        setBatchQueue([...nextQueue])
      }

      setBatchQueue(nextQueue)
      setBatchSummary({
        totalFiles: nextQueue.length,
        totalProcessed: nextQueue.filter((item) => item.status === 'processado').length,
        totalFailed: nextQueue.filter((item) => item.status === 'erro').length,
        totalPersisted: nextQueue.reduce((total, item) => total + (item.savedCount || 0), 0),
      })
      setStatusText(`Lote finalizado. ${nextQueue.filter((item) => item.status === 'processado').length} processado(s)`)
      toast.success('Processamento em lote concluido')
    } catch (error) {
      setBatchQueue((current) => current.map((item) => (item.status === 'processando' ? { ...item, status: 'erro', error: error.message } : item)))
      setStatusText('Falha no processamento em lote')
      setErrorText(error.message || 'Nao foi possivel processar o lote')
      toast.error(error.message || 'Nao foi possivel processar o lote')
    } finally {
      setIsBatchProcessing(false)
    }
  }

  const hasActiveSelection = activeTab === 'lote' ? batchQueue.length > 0 : Boolean(imageFile)
  const isActiveProcessing = activeTab === 'lote' ? isBatchProcessing : isAnalyzing
  const canExecuteActiveSelection = activeTab === 'lote' ? batchFiles.length > 0 : Boolean(imageFile)

  return (
    <AppShell breadcrumb="Análise / Scanner de PCBs">
      <div className="p-6 h-[calc(100vh-48px)] flex flex-col gap-6 overflow-hidden relative">
        <span className="sr-only">Imagem para analise</span>
        <span className="sr-only">Codigo do modelo selecionado</span>
        <span className="sr-only">Defeitos persistidos</span>
        
        <div className="flex flex-wrap items-center justify-between gap-3 bg-bg-panel border border-border p-4 rounded-2xl shadow-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="min-w-[240px]">
              <p className="text-xs text-text-muted uppercase font-mono mb-1">Modelo da placa</p>
              <select
                value={selectedModelCodigo}
                onChange={(event) => setSelectedModelCodigo(event.target.value)}
                className={`w-full bg-bg-elevated border border-border font-mono text-sm font-black uppercase rounded-lg px-3 py-2.5 outline-none focus:border-amber transition-colors ${selectedModelCodigo ? 'text-text-primary' : 'text-red-500'}`}
              >
                <option value="">Selecione um modelo cadastrado</option>
                {models.map((modelo) => (
                  <option key={modelo.codigo} value={modelo.codigo}>
                    {modelo.codigo}
                  </option>
                ))}
              </select>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.png,image/jpeg,image/png"
              onChange={onImageChange}
              className="hidden"
            />
            <input
              ref={batchFolderInputRef}
              type="file"
              multiple
              webkitdirectory=""
              directory=""
              onChange={handleBatchSelection}
              className="hidden"
            />
            
            <button
              onClick={handleSelectFile}
              className="px-4 py-2.5 bg-bg-elevated border border-border text-text-primary font-mono text-sm font-black uppercase rounded-lg hover:border-amber transition-all cursor-pointer"
            >
              {hasActiveSelection ? 'Trocar arquivo' : 'Carregar arquivo'}
            </button>

            {hasActiveSelection && (
              <button
                onClick={clearActiveSelection}
                className="px-4 py-2.5 bg-bg-elevated border border-critical-border text-critical-text font-mono text-sm font-black uppercase rounded-lg hover:bg-critical-bg transition-all cursor-pointer"
              >
                Remover
              </button>
            )}

            <button
              onClick={activeTab === 'lote' ? runBatchProcessing : runDetection}
              disabled={isActiveProcessing || !canExecuteActiveSelection || !selectedModelCodigo}
              className="px-4 py-2.5 bg-amber disabled:opacity-40 text-black font-mono text-sm font-black uppercase rounded-lg hover:bg-amber-600 transition-all cursor-pointer"
            >
              {isActiveProcessing ? 'Processando...' : activeTab === 'lote' ? 'Executar lote' : 'Executar deteccao'}
            </button>
          </div>

          <div className="text-right min-w-[220px]">
            <p className="text-xs text-text-muted uppercase font-mono">Modelo carregado</p>
            <p className="text-sm text-text-primary font-mono">Modelo: {MODEL_PATH}</p>
            <p className="text-sm text-text-secondary font-mono">Selecionado: {selectedModelCodigo || 'nenhum'}</p>
          </div>
        </div>

        <div className="bg-bg-panel border border-border rounded-2xl p-2 shrink-0 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-black uppercase transition-colors ${activeTab === 'individual' ? 'bg-amber text-black' : 'bg-bg-elevated text-text-secondary border border-border'}`}
          >
            Imagem individual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lote')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-black uppercase transition-colors ${activeTab === 'lote' ? 'bg-amber text-black' : 'bg-bg-elevated text-text-secondary border border-border'}`}
          >
            Processamento em lote
          </button>
        </div>

        <div className="bg-bg-panel border border-border rounded-2xl p-4 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p className="text-sm font-black uppercase tracking-widest text-text-secondary">Defeitos do modelo</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllClasses}
                className="px-3 py-2 bg-bg-elevated border border-border text-xs uppercase font-mono rounded hover:border-amber transition-colors cursor-pointer"
              >
                Selecionar todos
              </button>
              <button
                type="button"
                onClick={clearSelectedClasses}
                className="px-3 py-2 bg-bg-elevated border border-border text-xs uppercase font-mono rounded hover:border-amber transition-colors cursor-pointer"
              >
                Limpar selecao
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableClasses.map((className) => (
              <label key={className} className="flex items-center gap-2 text-sm font-mono text-text-primary border border-border rounded px-2 py-2 bg-bg-base/70 cursor-pointer">
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
              <p className="text-sm text-text-muted uppercase font-mono">Selecione um modelo para carregar os defeitos do banco</p>
            )}
          </div>
        </div>

        {activeTab === 'lote' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 min-h-0">
            <div className="bg-bg-panel border border-border rounded-2xl p-4 flex flex-col gap-4 min-h-0">
              <div className="border border-border rounded-lg p-3 bg-bg-base/60">
                <p className="text-xs uppercase font-black tracking-widest text-text-secondary">Total selecionado</p>
                <p className="text-2xl font-mono text-amber">{batchQueue.length}</p>
                <p className="text-xs font-mono text-text-secondary">{batchFiles.length} arquivo(s) aguardando validação</p>
              </div>

              <div className="border border-border rounded-lg p-3 bg-bg-base/60">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase font-black tracking-widest text-text-secondary">Progresso</p>
                  <p className="text-xs font-mono text-amber">{batchProgress}%</p>
                </div>
                <div className="h-2 bg-bg-elevated rounded overflow-hidden">
                  <div className="h-full bg-amber transition-all" style={{ width: `${batchProgress}%` }} />
                </div>
              </div>

              {batchReport && (
                <div className="border border-success-border rounded-lg p-3 bg-success-bg/20">
                  <p className="text-xs uppercase font-black tracking-widest text-success-text">Relatorio criado</p>
                  <p className="text-sm font-mono text-text-primary">#{batchReport.id}</p>
                  <p className="text-xs font-mono text-text-secondary">Usuario #{batchReport.id_usuario_criador}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-auto">
                <button
                  type="button"
                  onClick={clearBatch}
                  disabled={isBatchProcessing}
                  className="px-4 py-2.5 bg-bg-elevated border border-critical-border text-critical-text font-mono text-sm font-black uppercase rounded-lg hover:bg-critical-bg transition-all cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="bg-bg-panel border border-border rounded-2xl flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 border-b border-border bg-bg-elevated/20 flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-widest text-text-secondary">Arquivos selecionados</span>
                {batchSummary && (
                  <span className="text-xs font-mono text-text-secondary">
                    {batchSummary.totalProcessed} processados · {batchSummary.totalFailed} erros · {batchSummary.totalPersisted} defeitos
                  </span>
                )}
              </div>
              <div className="overflow-auto min-h-0 divide-y divide-border">
                {batchQueue.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openBatchItemPreview(item)}
                    className="w-full p-3 grid grid-cols-[1fr_auto] gap-3 items-center text-left hover:bg-bg-elevated/40 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-mono text-text-primary truncate">{item.name}</p>
                      <p className="text-xs font-mono text-text-secondary">
                        {item.detections.length} deteccoes · {item.savedCount} persistidos
                      </p>
                      {item.error && <p className="text-xs font-mono text-critical-text truncate">{item.error}</p>}
                    </div>
                    <span className={`text-xs font-mono uppercase px-2 py-1 rounded border ${
                      item.status === 'processado'
                        ? 'text-success-text border-success-border bg-success-bg/20'
                        : item.status === 'erro'
                          ? 'text-critical-text border-critical-border bg-critical-bg/20'
                          : item.status === 'processando'
                            ? 'text-amber border-amber/40 bg-amber/10'
                            : 'text-text-muted border-border bg-bg-elevated'
                    }`}>
                      {item.status}
                    </span>
                  </button>
                ))}

                {!batchQueue.length && (
                  <div className="h-full min-h-[260px] flex items-center justify-center text-text-muted text-sm uppercase font-mono">
                    Nenhuma imagem selecionada
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'individual' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          <div className="bg-bg-panel border border-border rounded-3xl flex flex-col overflow-hidden min-h-0">
            <div className="p-4 border-b border-border bg-bg-elevated/20">
              <span className="text-sm font-black uppercase tracking-widest text-text-secondary">Imagem original</span>
            </div>
            
            <div ref={originalCanvasWrapperRef} className="flex-1 flex items-center justify-center p-4 bg-black/40 min-h-0 overflow-auto">
              {!imageFile && <div className="text-text-muted text-sm uppercase font-mono">Aguardando imagem</div>}

              {imageFile && selectedImageUrl && (
                <canvas ref={originalCanvasRef} className="max-w-full rounded-lg border border-border" />
              )}
            </div>
          </div>

          <div className="bg-bg-panel border border-border rounded-3xl flex flex-col overflow-hidden min-h-0">
            <div className="p-4 border-b border-border bg-bg-elevated/20 flex justify-between items-center">
              <span className="text-sm font-black uppercase tracking-widest text-text-secondary">Defeito ampliado</span>
              <span className="text-sm font-mono text-amber">{detections.length} itens</span>
            </div>
            <div ref={cropCanvasWrapperRef} className="flex-1 flex items-center justify-center p-4 bg-black/40 min-h-0 overflow-auto">
              <canvas ref={cropCanvasRef} className="max-w-full rounded-lg border border-border" />
            </div>

            <div className="p-4 border-t border-border bg-bg-base/60 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={detections.length < 2}
                onClick={goToPrevDetection}
                className="px-3 py-2 bg-bg-elevated border border-border text-xs uppercase font-mono rounded disabled:opacity-40 hover:border-amber transition-colors cursor-pointer"
              >
                &lt; Defeito anterior
              </button>

              <div className="text-center">
                {selectedDetection ? (
	                  <>
	                    <p className="text-sm text-text-primary font-mono">Defeito {selectedIndex + 1} de {detections.length}</p>
	                    <p className="text-sm text-text-secondary font-mono">Classe: {selectedDetection.label}</p>
	                    <p className="text-sm text-text-secondary font-mono">Confianca: {formatConfidence(selectedDetection.confidence)}</p>
	                    <p className={`text-sm font-mono ${normalizeDetectionClassificacao(selectedDetection) === 'falso_positivo' ? 'text-critical-text' : 'text-success-text'}`}>
	                      Classificacao: {getClassificacaoLabel(normalizeDetectionClassificacao(selectedDetection))}
	                    </p>
	                    <div className="mt-2 inline-flex rounded-lg border border-border bg-bg-elevated p-1">
	                      <button
	                        type="button"
	                        onClick={() => updateSelectedDetectionClassificacao('real')}
	                        className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-black font-mono transition-colors cursor-pointer ${normalizeDetectionClassificacao(selectedDetection) === 'real' ? 'bg-success-text text-black' : 'text-text-secondary hover:text-text-primary'}`}
	                      >
	                        Confirmado
	                      </button>
	                      <button
	                        type="button"
	                        onClick={() => updateSelectedDetectionClassificacao('falso_positivo')}
	                        className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-black font-mono transition-colors cursor-pointer ${normalizeDetectionClassificacao(selectedDetection) === 'falso_positivo' ? 'bg-critical-text text-black' : 'text-text-secondary hover:text-text-primary'}`}
	                      >
	                        Falso positivo
	                      </button>
	                    </div>
	                  </>
                ) : (
                  <p className="text-sm text-text-muted font-mono">Nenhum defeito selecionado</p>
                )}
              </div>

              <button
                type="button"
                disabled={detections.length < 2}
                onClick={goToNextDetection}
                className="px-3 py-2 bg-bg-elevated border border-border text-xs uppercase font-mono rounded disabled:opacity-40 hover:border-amber transition-colors cursor-pointer"
              >
                Proximo defeito &gt;
              </button>
            </div>

            <div className="px-4 pb-4 border-t border-border bg-bg-base/40">
              <div className="pt-3 flex items-center justify-between gap-2 mb-2">
                <p className="text-xs uppercase font-black tracking-widest text-text-secondary">Defeitos detectados</p>
                <p className="text-xs font-mono text-text-secondary">{detections.length} resultado(s)</p>
              </div>

              <div className="flex flex-wrap gap-2">
	                {detections.map((detection, index) => {
	                  const isSelected = index === selectedIndex
	                  const isFalsePositive = normalizeDetectionClassificacao(detection) === 'falso_positivo'
	                  return (
	                    <button
	                      key={`${detection.label || 'defeito'}-${index}`}
	                      type="button"
	                      onClick={() => setSelectedIndex(index)}
	                      className={`px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${isFalsePositive ? 'border-critical-border bg-critical-bg/20 text-critical-text' : isSelected ? 'border-amber bg-amber/10 text-amber' : 'border-border bg-bg-elevated text-text-secondary hover:border-amber'}`}
	                    >
	                      <p className="text-xs font-black uppercase font-mono">{detection.label || 'defeito'}</p>
	                      <p className="text-[11px] font-mono">Conf: {formatConfidence(detection.confidence)}</p>
	                      <p className="text-[10px] font-mono uppercase">{getClassificacaoLabel(normalizeDetectionClassificacao(detection))}</p>
	                    </button>
	                  )
	                })}

                {!detections.length && (
                  <p className="text-sm text-text-muted font-mono">Nenhum defeito detectado ainda</p>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        <div className="bg-bg-panel border border-border p-4 rounded-2xl shadow-2xl shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase font-black tracking-widest text-text-secondary">Estado atual</p>
            <p className="text-base font-mono text-text-primary">{statusText}</p>
            {errorText && <p className="text-sm font-mono text-red-400">{errorText}</p>}
            {savedPlaca && (
              <p className="text-sm font-mono text-success-text">Placa persistida: #{savedPlaca.id} · {savedPlaca.modelo_codigo}</p>
            )}
          </div>

	          <div>
	            <p className="text-xs uppercase font-black tracking-widest text-text-secondary">Quantidade de defeitos</p>
	            <p className="text-base font-mono text-amber">{detections.length} defeitos temporarios</p>
	            <p className="text-sm font-mono text-text-secondary">Confirmados: {detectionSummary.reais} · Falsos positivos: {detectionSummary.falsos}</p>
	            <p className="text-sm font-mono text-text-secondary">Persistidos: {savedDetections.length}</p>
	          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveDetections}
              disabled={isSaving || detections.length === 0 || !selectedModelCodigo || (savedDetections.length > 0 && savedDetections.length === detections.length)}
              className="px-4 py-2.5 bg-success-text/90 text-black font-mono text-sm font-black uppercase rounded-lg hover:bg-success-text disabled:opacity-40 transition-all cursor-pointer"
            >
              {isSaving ? 'Salvando...' : 'Salvar defeitos detectados'}
            </button>
            <button
              type="button"
              onClick={cancelDetections}
              disabled={isAnalyzing && detections.length === 0}
              className="px-4 py-2.5 bg-bg-elevated border border-critical-border text-critical-text font-mono text-sm font-black uppercase rounded-lg hover:bg-critical-bg transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

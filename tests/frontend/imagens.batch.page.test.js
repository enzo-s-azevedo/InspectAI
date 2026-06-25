import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import InspecaoImagens from '@/app/imagens/page'
import { api } from '@/services/api'
import { toast } from 'sonner'

jest.mock('@/components/AppShell', () => {
  return function MockAppShell({ children }) {
    return <div data-testid="app-shell">{children}</div>
  }
})

jest.mock('@/services/api', () => ({
  api: {
    getModelos: jest.fn(),
    getDefeitos: jest.fn(),
    processarLoteImagens: jest.fn(),
    analisarImagem: jest.fn(),
    salvarDeteccoes: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}))

describe('Aba de processamento em lote de imagens', () => {
  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      drawImage: jest.fn(),
      strokeRect: jest.fn(),
      measureText: jest.fn(() => ({ width: 80 })),
    }))
    URL.createObjectURL = jest.fn(() => 'blob:inspectai-test')
    URL.revokeObjectURL = jest.fn()
  })

  beforeEach(() => {
    jest.clearAllMocks()

    api.getModelos.mockResolvedValue([{ codigo: 'PCB-001' }])
    api.getDefeitos.mockResolvedValue([{ classe_defeito: 'trinca' }])
    api.analisarImagem.mockResolvedValue({
      detections: [
        { label: 'trinca', confidence: 0.93, bbox: [10, 12, 80, 90] },
        { label: 'furo', confidence: 0.81, bbox: [100, 40, 150, 110] },
      ],
      inputType: 'imagem',
    })
    api.salvarDeteccoes.mockResolvedValue({
      placa: { id: 1, modelo_codigo: 'PCB-001' },
      savedDefeitos: [
        { id: 1, classe_defeito: 'trinca', classificacao: 'real', status_confirmacao: 'confirmado' },
        { id: 2, classe_defeito: 'furo', classificacao: 'falso_positivo', status_confirmacao: 'falso_positivo' },
      ],
    })

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { classes: ['trinca'] },
      }),
    })
  })

  it('seleciona uma pasta valida pelo botao principal e processa o lote', async () => {
    const { container } = render(<InspecaoImagens />)

    fireEvent.click(screen.getByRole('button', { name: /processamento em lote/i }))

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'PCB-001' })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'PCB-001' } })

    const batchInput = container.querySelector('input[type="file"][multiple][webkitdirectory]')
    expect(batchInput).toBeInTheDocument()

    const validPng = new File(['conteudo'], 'placa-a.png', { type: 'image/png' })

    fireEvent.change(batchInput, {
      target: {
        files: [validPng],
      },
    })

    expect(screen.getByText('placa-a.png')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /trocar arquivo/i })).toBeInTheDocument()

    const totalSelecionado = screen.getByText('Total selecionado').closest('div')
    expect(within(totalSelecionado).getByText('1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /executar lote/i }))

    await waitFor(() => {
      expect(api.analisarImagem).toHaveBeenCalledTimes(1)
    })

    const submittedFormData = api.analisarImagem.mock.calls[0][0]
    expect(submittedFormData.get('modelo_codigo')).toBe('PCB-001')
    expect(submittedFormData.get('file')).toEqual(validPng)

    await waitFor(() => {
      expect(screen.getByText('processado')).toBeInTheDocument()
      expect(screen.getByText('2 deteccoes · 0 persistidos')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /placa-a\.png/i }))

    await waitFor(() => {
      expect(screen.getByText('Defeito 1 de 2')).toBeInTheDocument()
    })
  })

  it('aceita arquivo jpeg no processamento em lote', async () => {
    const { container } = render(<InspecaoImagens />)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'PCB-001' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /processamento em lote/i }))

    const batchInput = container.querySelector('input[type="file"][multiple][webkitdirectory]')
    const validJpeg = new File(['conteudo'], 'placa-b.jpeg', { type: 'image/jpeg' })

    fireEvent.change(batchInput, {
      target: {
        files: [validJpeg],
      },
    })

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'PCB-001' } })
    fireEvent.click(screen.getByRole('button', { name: /executar lote/i }))

    await waitFor(() => {
      expect(api.analisarImagem).toHaveBeenCalledTimes(1)
    })

    const submittedFormData = api.analisarImagem.mock.calls[0][0]
    expect(submittedFormData.get('file')).toEqual(validJpeg)

    await waitFor(() => {
      expect(screen.getByText('processado')).toBeInTheDocument()
    })
  })

  it('faz upload do lote inteiro e exibe erro por arquivo invalido apos o processamento', async () => {
    const { container } = render(<InspecaoImagens />)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'PCB-001' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /processamento em lote/i }))

    const batchInput = container.querySelector('input[type="file"][multiple][webkitdirectory]')
    const validPng = new File(['conteudo'], 'placa-a.png', { type: 'image/png' })
    const invalidTxt = new File(['conteudo'], 'observacao.txt', { type: 'text/plain' })

    fireEvent.change(batchInput, {
      target: {
        files: [validPng, invalidTxt],
      },
    })

    expect(screen.getByText('placa-a.png')).toBeInTheDocument()
    expect(screen.getByText('observacao.txt')).toBeInTheDocument()
    expect(screen.getByText('2 arquivo(s) aguardando validação')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'PCB-001' } })
    fireEvent.click(screen.getByRole('button', { name: /executar lote/i }))

    await waitFor(() => {
      expect(api.analisarImagem).toHaveBeenCalledTimes(1)
    })

    const submittedFormData = api.analisarImagem.mock.calls[0][0]
    expect(submittedFormData.get('file')).toEqual(validPng)

    await waitFor(() => {
      expect(screen.getByText('processado')).toBeInTheDocument()
      expect(screen.getByText('erro')).toBeInTheDocument()
    })

    const errorItem = screen.getByRole('button', { name: /observacao\.txt/i })
    expect(errorItem).toHaveTextContent('Formato nao suportado. Use apenas .jpg ou .png')

    fireEvent.click(screen.getByRole('button', { name: /placa-a\.png/i }))

    await waitFor(() => {
      expect(screen.getByText('Defeito 1 de 2')).toBeInTheDocument()
    })

    expect(screen.getByText('Classe: trinca')).toBeInTheDocument()
    expect(screen.getByText('Defeitos detectados')).toBeInTheDocument()
  })

  it('na aba individual aceita somente uma imagem .jpg ou .png', async () => {
    const { container } = render(<InspecaoImagens />)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'PCB-001' })).toBeInTheDocument()
    })

    const individualInput = container.querySelector('input[type="file"]:not([multiple])')
    const validPng = new File(['conteudo'], 'placa-a.png', { type: 'image/png' })
    const invalidTxt = new File(['conteudo'], 'observacao.txt', { type: 'text/plain' })

    fireEvent.change(individualInput, {
      target: {
        files: [invalidTxt],
      },
    })

    expect(toast.error).toHaveBeenCalledWith('Selecione apenas uma imagem .jpg ou .png')

    fireEvent.change(individualInput, {
      target: {
        files: [validPng],
      },
    })

    expect(screen.getByRole('button', { name: /trocar arquivo/i })).toBeInTheDocument()
  })

  it('na aba individual exibe as deteccoes e o zoom apos o processamento', async () => {
    const { container } = render(<InspecaoImagens />)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'PCB-001' })).toBeInTheDocument()
    })

    const individualInput = container.querySelector('input[type="file"]:not([multiple])')
    const validPng = new File(['conteudo'], 'placa-a.png', { type: 'image/png' })

    fireEvent.change(individualInput, {
      target: {
        files: [validPng],
      },
    })

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'PCB-001' } })
    fireEvent.click(screen.getByRole('button', { name: /executar deteccao/i }))

    await waitFor(() => {
      expect(api.analisarImagem).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByText('Deteccao concluida. 2 defeito(s) identificado(s)')).toBeInTheDocument()
    expect(screen.getByText('Defeito 1 de 2')).toBeInTheDocument()
    expect(screen.getByText('Classe: trinca')).toBeInTheDocument()
    expect(screen.getByText('Confianca: 0.93')).toBeInTheDocument()
    expect(screen.getByText('Classificacao: Confirmado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^confirmado$/i })).toBeInTheDocument()
    expect(screen.getByText('Defeitos detectados')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /trinca/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /furo/i })).toBeInTheDocument()
  })

  it('permite marcar uma deteccao como falso positivo antes de salvar no relatorio', async () => {
    const { container } = render(<InspecaoImagens />)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'PCB-001' })).toBeInTheDocument()
    })

    const individualInput = container.querySelector('input[type="file"]:not([multiple])')
    const validPng = new File(['conteudo'], 'placa-a.png', { type: 'image/png' })

    fireEvent.change(individualInput, {
      target: {
        files: [validPng],
      },
    })

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'PCB-001' } })
    fireEvent.click(screen.getByRole('button', { name: /executar deteccao/i }))

    await waitFor(() => {
      expect(screen.getByText('Defeito 1 de 2')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /furo/i }))
    fireEvent.click(screen.getByRole('button', { name: /^falso positivo$/i }))
    fireEvent.click(screen.getByRole('button', { name: /salvar defeitos detectados/i }))

    await waitFor(() => {
      expect(api.salvarDeteccoes).toHaveBeenCalledTimes(1)
    })

    const payload = api.salvarDeteccoes.mock.calls[0][0]
    expect(payload.detections).toMatchObject([
      { label: 'trinca', classificacao: 'real', status_confirmacao: 'confirmado' },
      { label: 'furo', classificacao: 'falso_positivo', status_confirmacao: 'falso_positivo' },
    ])
  })

  it('permite voltar uma deteccao de falso positivo para confirmado antes de salvar', async () => {
    const { container } = render(<InspecaoImagens />)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'PCB-001' })).toBeInTheDocument()
    })

    const individualInput = container.querySelector('input[type="file"]:not([multiple])')
    const validPng = new File(['conteudo'], 'placa-a.png', { type: 'image/png' })

    fireEvent.change(individualInput, {
      target: {
        files: [validPng],
      },
    })

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'PCB-001' } })
    fireEvent.click(screen.getByRole('button', { name: /executar deteccao/i }))

    await waitFor(() => {
      expect(screen.getByText('Defeito 1 de 2')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /furo/i }))
    fireEvent.click(screen.getByRole('button', { name: /^falso positivo$/i }))
    fireEvent.click(screen.getByRole('button', { name: /^falso positivo$/i }))
    fireEvent.click(screen.getByRole('button', { name: /salvar defeitos detectados/i }))

    await waitFor(() => {
      expect(api.salvarDeteccoes).toHaveBeenCalledTimes(1)
    })

    const payload = api.salvarDeteccoes.mock.calls[0][0]
    expect(payload.detections).toMatchObject([
      { label: 'trinca', classificacao: 'real', status_confirmacao: 'confirmado' },
      { label: 'furo', classificacao: 'real', status_confirmacao: 'confirmado' },
    ])
  })
})

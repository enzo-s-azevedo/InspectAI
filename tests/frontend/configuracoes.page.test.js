import { render, screen, waitFor } from '@testing-library/react'
import ConfiguracoesPage from '@/app/configuracoes/page'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/services/api', () => ({
  api: {
    getModelos: jest.fn().mockResolvedValue([]),
    criarModelo: jest.fn(),
  },
}))

jest.mock('@/components/AppShell', () => {
  return function MockAppShell({ children }) {
    return <div data-testid="app-shell">{children}</div>
  }
})

describe('Barreira de Segurança - Tela de Modelos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Deve exibir acesso negado se o usuário for FUNCIONARIO', () => {
    const mockPush = jest.fn()
    useRouter.mockReturnValue({ push: mockPush })
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({ cargo: 'FUNCIONARIO' }))

    render(<ConfiguracoesPage />)

    expect(mockPush).toHaveBeenCalledWith('/acesso-negado')
  })

  it('Deve liberar a tela de cadastro de modelos se for ADMINISTRADOR', async () => {
    const mockPush = jest.fn()
    useRouter.mockReturnValue({ push: mockPush })
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({ cargo: 'ADMINISTRADOR' }))

    render(<ConfiguracoesPage />)

    await waitFor(() => {
      expect(screen.getByText(/Administração de modelos/i)).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })
})

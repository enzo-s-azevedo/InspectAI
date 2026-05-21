import { render, screen, waitFor } from '@testing-library/react'
import UsuariosPage from '@/app/usuarios/page'
import { useRouter } from 'next/navigation'

// 1. Mock do roteador do Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn()
}))

// 2. Mock da API para o componente não tentar fazer requisições reais durante o teste (limpa o erro do act...)
jest.mock('@/services/api', () => ({
  api: {
    getUsuarios: jest.fn().mockResolvedValue([])
  }
}))

// 3. Mock do AppShell para o menu não quebrar tentando carregar ícones
jest.mock('@/components/AppShell', () => {
  return function MockAppShell({ children }) {
    return <div data-testid="app-shell">{children}</div>
  }
})

describe('Barreira de Segurança - Tela de Usuários', () => {
  beforeEach(() => {
    // Limpa a memória dos testes anteriores
    jest.clearAllMocks()
  })

  it('Deve expulsar o usuário para a Home ( / ) se ele for FUNCIONARIO', () => {
    const mockPush = jest.fn()
    useRouter.mockReturnValue({ push: mockPush })

    // Simulamos o LocalStorage contendo um funcionário comum
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({ cargo: 'FUNCIONARIO' }))

    // Tentamos renderizar a tela
    render(<UsuariosPage />)

    // A prova real: Verificamos se a função de expulsar foi chamada mandando pra raiz
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('Deve liberar o acesso se for ADMINISTRADOR', async () => {
    const mockPush = jest.fn()
    useRouter.mockReturnValue({ push: mockPush })

    // Simulamos um Admin logado
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({ cargo: 'ADMINISTRADOR' }))

    // Renderiza a página normalmente
    render(<UsuariosPage />)

    // 👇 O SEGREDO ESTÁ AQUI: Obriga o Jest a esperar o "Carregando..." sumir
    await waitFor(() => {
      // Quando a API falsa responde, o componente mostra essa frase:
      expect(screen.getByText(/0 usuários cadastrados/i)).toBeInTheDocument()
    })

    // A prova real: O router.push não pode ter sido chamado nenhuma vez
    expect(mockPush).not.toHaveBeenCalled()
  })
})
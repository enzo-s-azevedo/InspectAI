import { render, screen, waitFor } from '@testing-library/react'
import AppShell from '@/components/AppShell'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/defeitos'),
}))

describe('Permissões visuais do AppShell', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Oculta menus administrativos para FUNCIONARIO', async () => {
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({ cargo: 'FUNCIONARIO', permissoes: [] }))

    render(<AppShell breadcrumb="Teste"><div>Conteúdo</div></AppShell>)

    await waitFor(() => {
      expect(screen.getByText('FN')).toBeInTheDocument()
    })

    expect(screen.queryByTitle('Modelos')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Usuários')).not.toBeInTheDocument()
  })

  it('Exibe menus administrativos para ADMINISTRADOR', async () => {
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({
      cargo: 'ADMINISTRADOR',
      permissoes: ['ADMIN', 'RELATORIOS'],
    }))

    render(<AppShell breadcrumb="Teste"><div>Conteúdo</div></AppShell>)

    await waitFor(() => {
      expect(screen.getByText('AD')).toBeInTheDocument()
    })

    expect(screen.getByTitle('Modelos')).toBeInTheDocument()
    expect(screen.getByTitle('Usuários')).toBeInTheDocument()
  })
})

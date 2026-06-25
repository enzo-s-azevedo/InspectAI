import { test, expect } from '@playwright/test'

test.describe('Fluxo do Banco de Defeitos', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login')
    await page.getByPlaceholder('E-MAIL').fill('rogerioceni@email.com')
    await page.getByPlaceholder('SENHA').fill('spfc')
    await page.getByRole('button', { name: /entrar no sistema/i }).click()
    await expect(page).toHaveURL('http://localhost:3000/')
  })

  test('deve acessar o banco de defeitos e exibir o painel de métricas e busca', async ({ page }) => {
    // 1. Vai para a tela de defeitos
    await page.goto('http://localhost:3000/defeitos')
    await expect(page.getByRole('heading', { name: /banco de defeitos/i })).toBeVisible()
    
    // 2. Verifica se a barra de pesquisa carregou e está pronta para uso
    await expect(page.getByPlaceholder('Buscar por ID, placa ou defeito...')).toBeVisible()
    
    // 3. Verifica se os cards do resumo (Dashboard superior) apareceram
    await expect(page.getByText(/total de defeitos/i)).toBeVisible()
    await expect(page.getByText(/confirmados/i)).toBeVisible()
    await expect(page.getByText(/falsos positivos/i)).toBeVisible()
  })
})
import { test, expect } from '@playwright/test'

test.describe('Fluxo do Scanner de PCBs', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login')
    await page.getByPlaceholder('E-MAIL').fill('rogerioceni@email.com')
    await page.getByPlaceholder('SENHA').fill('spfc')
    await page.getByRole('button', { name: /entrar no sistema/i }).click()
    await expect(page).toHaveURL('http://localhost:3000/')
  })

  test('deve acessar a tela de análise e renderizar os botões de ação do scanner', async ({ page }) => {
    // 1. Vai para a tela de imagens/scanner
    await page.goto('http://localhost:3000/imagens')
    
    // 2. Valida se os botões principais da ferramenta estão na tela
    await expect(page.getByRole('button', { name: /carregar arquivo/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /executar deteccao/i })).toBeVisible()
    
    // 3. Valida se as seções do layout carregaram
    await expect(page.getByText(/modelo da placa/i)).toBeVisible()
    await expect(page.getByText(/defeitos do modelo/i)).toBeVisible()
  })
})
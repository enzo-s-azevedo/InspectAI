import { test, expect } from '@playwright/test'

test.describe('Fluxo de Administração de Modelos', () => {

  // O robô faz login antes de cada teste começar
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login')
    await page.getByPlaceholder('E-MAIL').fill('admin@admin.com')
    await page.getByPlaceholder('SENHA').fill('admin')
    await page.getByRole('button', { name: /entrar no sistema/i }).click()
    
    // Aguarda o login processar e ir para a home
    await expect(page).toHaveURL('http://localhost:3000/')
  })

  test('deve acessar a tela de modelos e cadastrar um novo modelo com sucesso', async ({ page }) => {
    // 1. Vai para a tela de modelos
    await page.goto('http://localhost:3000/configuracoes')
    await expect(page.getByRole('heading', { name: /administração de modelos/i })).toBeVisible()

    // 2. Cria um código único usando a data atual para o teste não quebrar se rodar duas vezes
    const modeloUnico = `PCB-TESTE-${Date.now()}`
    
    // 3. Preenche o formulário
    await page.getByPlaceholder('PCB-A001-L1').fill(modeloUnico)
    await page.getByRole('button', { name: /cadastrar modelo/i }).click()

    // 4. Valida se o sistema exibiu a mensagem de sucesso
    await expect(page.getByText('Modelo cadastrado com sucesso')).toBeVisible()
    
    // 5. Valida se o modelo apareceu na lista da direita
    await expect(page.getByText(modeloUnico)).toBeVisible()
  })
})
import { test, expect } from '@playwright/test'

test.describe('Fluxo de Autenticação', () => {
  
  test('deve fazer login com sucesso e redirecionar para a página inicial', async ({ page }) => {
    await page.goto('http://localhost:3000/login')

    await page.getByPlaceholder('E-MAIL').fill('rogerioceni@email.com') // 👈 Altere para o seu email de teste
    await page.getByPlaceholder('SENHA').fill('spfc')               // 👈 Altere para a sua senha

    await page.getByRole('button', { name: /entrar no sistema/i }).click()

    await expect(page).toHaveURL('http://localhost:3000/')
  })

  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    await page.goto('http://localhost:3000/login')

    await page.getByPlaceholder('E-MAIL').fill('hacker@email.com')
    await page.getByPlaceholder('SENHA').fill('senhaerrada')

    await page.getByRole('button', { name: /entrar no sistema/i }).click()

    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible()
  })
})
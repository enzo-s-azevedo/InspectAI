import { test, expect } from '@playwright/test'

test.describe('Fluxo de Gerenciamento de Usuários', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login')
    await page.getByPlaceholder('E-MAIL').fill('admin@admin.com')
    await page.getByPlaceholder('SENHA').fill('admin')
    await page.getByRole('button', { name: /entrar no sistema/i }).click()
    await expect(page).toHaveURL('http://localhost:3000/')
  })

  test('deve abrir o formulário de novo usuário', async ({ page }) => {
    await page.goto('http://localhost:3000/usuarios')
    await expect(page.getByRole('heading', { name: /gerenciamento de usuários/i })).toBeVisible()

    // Clica no botão para abrir o formulário
    await page.getByRole('button', { name: /novo usuário/i }).click()

    // Valida se os campos do formulário apareceram na tela
    await expect(page.getByPlaceholder('Ex: João da Silva')).toBeVisible()
    await expect(page.getByPlaceholder('joao@inspectai.com')).toBeVisible()
  })
})
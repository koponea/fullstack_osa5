const { test, describe, expect } = require('@playwright/test')

const url = 'http://localhost:5173'

describe('Note app', () => {
  test('front page can be opened', async ({ page }) => {
    await page.goto(url)

    const locator = page.getByText(/^Notes$/)
    await expect(locator).toBeVisible()
    await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2025')).toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    await page.goto(url)

    await page.getByRole('button', { name: 'login' }).click()
  })
})
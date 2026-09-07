const { test, describe, expect } = require('@playwright/test')

/**** UNDER CONSTRUCTION !! playable ****/

describe.skip('Note app', () => {
  test('front page can be opened', async ({ page }) => {
    await page.goto('/') // baseURL

    // still NOTES... !

    const locators = page.findAllByText('Notes')
    await expect(locators[0]).toBeVisible()
    await expect(locators[1]).toBeVisible()
    await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2025')).toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    await page.goto(url)

    await page.getByRole('button', { name: 'login' }).click()
  })
})
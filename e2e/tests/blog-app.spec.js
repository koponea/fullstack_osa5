const {
  test,
  expect,
  beforeEach,
  describe
} = require('@playwright/test')
const {
  dataTestId,
  dataTestIdStartsWith,
  genRndId,
  login,
  loginAndVerify,
  DEFAULT_USER,
  NOTIFICATION_CLASS,
} = require('../utils/helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset') // 3003
    await request.post('/api/users', { data: DEFAULT_USER })
    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = page.getByText(/^log into application$/)
    await expect(locator).toBeVisible()

    await page.getByRole('button', { name: 'log in' }).click()
    expect(await page.getByRole('textbox').all()).toHaveLength(2)
    expect(await page.getByLabel('username')).toBeVisible()
    expect(await page.getByLabel('password')).toBeVisible()

    expect(await page.getByRole('button', { name: 'login' })).toBeVisible()
    expect(await page.getByRole('button', { name: 'cancel' })).toBeVisible()

    await expect(page.getByText(/logged in/)).not.toBeVisible()
  })
})
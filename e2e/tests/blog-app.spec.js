const config = require('../utils/config')
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

const RGB_ERROR_RED = 'rgb(255, 0, 0)'
const RGB_NOTIFICATION_GREEN = 'rgb(0, 128, 0)'

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

    expect(await page.getByRole('button', { name: 'log in' })).toBeVisible()
    expect(await page.getByRole('button', { name: 'cancel' })).toBeVisible()

    await expect(page.getByText(/logged in/)).not.toBeVisible()
  })

  describe('Login', () => {

    test('succeeds with correct credentials', async ({ page }) => {
      test.setTimeout(120_000) //login

      await page.getByRole('button', { name: 'log in' }).click()
      console.log(config.USERNAME_DEFAULT, config.USER_NAME_DEFAULT)
      expect(await page.getByRole('textbox').all()).toHaveLength(2)

      await page.getByLabel('username').fill(config.USERNAME_DEFAULT)
      await page.getByLabel('password').fill(config.PASSWORD_DEFAULT)

      await page.getByTestId('submit-login').click() // login

      await expect(page.getByText(`${config.USER_NAME_DEFAULT} logged in`)).toBeVisible()

      expect(page.getByTestId(NOTIFICATION_CLASS.error)).not.toBeVisible()
      expect(page.getByTestId(NOTIFICATION_CLASS.info)).not.toBeVisible()

      const logoutButton = await page.getByTestId('logout').first() // wait for login
      expect(logoutButton).toBeVisible()

      expect(await page.locator(dataTestId('create-new-blog'))).toBeVisible({ timeout: 10_000 })
    })

    test('fails with wrong credentials', async ({ page }) => {
      await login({ page, ...DEFAULT_USER, password: 'wrong' })

      await expect(page.getByText('wrong username or password')).toBeVisible()

      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('wrong username or password')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', RGB_ERROR_RED)
      await expect(page.getByText(`${config.USERNAME_DEFAULT} logged in`)).not.toBeVisible()
    })
  })
})
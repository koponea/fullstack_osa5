const config = require('../utils/config')
const {
  test,
  describe,
  expect,
  beforeEach
} = require('@playwright/test')
const {
  dataTestId,
  dataTestIdStartsWith,
  genRndId,
  login,
  loginAndVerify,
  DEFAULT_USER,
  NOTIFICATION_CLASS,
  createNote
} = require('../utils/helper')

describe('Note app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {data: DEFAULT_USER})
    await page.goto('/')
  })

  test('front page can be opened', async ({ page }) => {
    const locator = page.getByText(/^Notes$/) // 'Notes' will bring also '... notes'
    await expect(locator).toBeVisible()
    await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2025')).toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    test.setTimeout(120_000) //login

    await page.getByRole('button', { name: 'login' }).click()
    console.log(config.USERNAME_DEFAULT, config.USER_NAME_DEFAULT)
    expect(await page.getByRole('textbox').all()).toHaveLength(2)

    await page.getByLabel('username').fill(config.USERNAME_DEFAULT)
    await page.getByLabel('password').fill(config.PASSWORD_DEFAULT)

    // LOST coordinates in with --ui ???! --->
    //await page.getByRole('button', { name: 'login' }).click()
    await page.getByTestId('submit-login').click() // login

    await expect(page.getByText(`${config.USER_NAME_DEFAULT} logged in`)).toBeVisible()

    expect(page.getByTestId(NOTIFICATION_CLASS.error)).not.toBeVisible()
    expect(page.getByTestId(NOTIFICATION_CLASS.info)).not.toBeVisible()

    const logoutButton = await page.getByTestId('logout').first() // wait for login
    expect(logoutButton).toBeVisible()

    // many stuff work --ui but must wait again if headless!!!
    // now config has also 10k, also the test timeout changed for this
    expect(await page.locator(dataTestId('new-note'))).toBeVisible({ timeout: 10_000 })
  })

  test('login fails with wrong password', async ({ page }) => {
    await login({ page, ...DEFAULT_USER, password: 'wrong' })

    await expect(page.getByText('wrong credentials')).toBeVisible()
    const errorDiv = page.locator('.error')
    await expect(errorDiv).toContainText('wrong credentials')
    await expect(errorDiv).toHaveCSS('border-style', 'solid')
    await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
    await expect(page.getByText(`${config.USERNAME_DEFAULT} logged in`)).not.toBeVisible()
  })

  describe('When logged in', () => {

    beforeEach(async ({ page }) =>
      await loginAndVerify({ page })
    )

    test('a new note can be created', async ({ page }) => {
      const RND_ID = genRndId()
      const newNoteText = `a note created by playwright 888-${RND_ID}`
      await createNote(page, newNoteText)

      await expect(page.getByText(newNoteText)).toBeVisible()
      // smallest el in the row where the /.*text.*/ is visible 
      expect(await page.locator(`li:text-is("${newNoteText}"):visible`))
    })


    describe('and a note exists', () => {
      beforeEach(async ({ page }) => {
        const RND_ID = genRndId()
        const newNoteText = `another note by playwright 999-${RND_ID}`
        await createNote(page, newNoteText)

        expect(await page.locator(`li:text-is("${newNoteText}"):visible`))
      })

      test('importance can be changed', async ({ page }) => {
        // default is important: true
        const locator =
          await page.locator(`${dataTestIdStartsWith('make-not-important-')}:visible`)
        await locator.click({ timeout: 20_000 })

        await expect(page.getByText('make important')).toBeVisible()
      })
    })
  })
})

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

const RGB_ERROR_RED = 'rgb(255, 0, 0)'
const RGB_NOTIFICATION_GREEN = 'rgb(0, 128, 0)'

describe.skip('Note app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', { data: DEFAULT_USER })
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
    await expect(errorDiv).toHaveCSS('color', RGB_ERROR_RED)
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

      const notificationBanner = page.locator('.notification')
      await expect(notificationBanner).toContainText('New note created')
      await expect(notificationBanner).toHaveCSS('border-style', 'solid')
      await expect(notificationBanner).toHaveCSS('color', RGB_NOTIFICATION_GREEN)
    })


    describe('and several notes exists', () => {
      const RND_ID = `040-${genRndId()}` // still telno in validation
      const noteText1st = `one more note by PW ${RND_ID}`
      const noteText2nd = `yet another note by PW ${RND_ID}`
      const noteText3rd = `really... note by PW ${RND_ID}`

      beforeEach(async ({ page }) => {
        // waitforia, ettei createt mene päällekkäin, kerkiää renderöidä
        await createNote(page, noteText1st)
        await page.locator(`li:text-is("${noteText1st}"):visible`).waitFor()
        await createNote(page, noteText2nd)
        await page.locator(`li:text-is("${noteText2nd}"):visible`).waitFor()
        await createNote(page, noteText3rd)
        await page.locator(`li:text-is("${noteText3rd}"):visible`).waitFor()
        // tai esim 3:s nappula:
        // page.locator('li').filter({ hasText: noteText3rd }).getByRole('button')
      })

      test('one of those can be made nonimportant', async ({ page }) => {
        // default is important: true
        const noteTextElement = page.getByText(noteText2nd)
        const noteParentElement = noteTextElement.locator('..') // XPath <3
        const noteImportantButton = noteParentElement
          .locator(`${dataTestIdStartsWith('make-not-important-')}:visible`)
        // tai:
        // page.locator('li').filter({ hasText: 'third note' }).getByRole('button')

        await noteImportantButton.click({ timeout: 20_000 })

        await expect(page.getByText('make important')).toBeVisible() // ===one
      })
    })
  })
})

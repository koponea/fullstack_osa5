const config = require('../utils/config')
const { test, describe, expect, beforeEach } = require('@playwright/test')

const notficationClass = { error: 'error', info: 'notification' }
const dataTestId = (locator) => `[data-testid=${locator}]`

const genRndId = () => Math.floor(Math.random() * 1000000000).toString()

describe('Note app', () => {

  beforeEach(async ({ page }) => {
    console.log('logging in to', config.FE_URL)
    await page.goto(config.FE_URL)
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

    expect(page.getByTestId(notficationClass.error)).not.toBeVisible()
    expect(page.getByTestId(notficationClass.info)).not.toBeVisible()

    const logoutButton = await page.getByTestId('logout').first() // wait for login
    expect(logoutButton).toBeVisible()

    // many stuff work --ui but must wait again if headless!!!
    // now config has also 10k, also the test timeout changed for this
    expect(await page.locator(dataTestId('new-note'))).toBeVisible({ timeout: 10_000 })
  })

  describe('When logged in', () => {

    beforeEach(async ({ page }) => {
      console.log('logging in with', config.USERNAME_DEFAULT)
      await page.getByRole('button', { name: 'login' }).click()
      await page.getByLabel('username').fill(config.USERNAME_DEFAULT)
      await page.getByLabel('password').fill(config.PASSWORD_DEFAULT)
      await page.getByTestId('submit-login').click()
      await expect(page.getByText(`${config.USER_NAME_DEFAULT} logged in`)).toBeVisible()
    })

    test('a new note can be created', async ({ page }) => {
      const RND_ID = genRndId()
      const newNoteText = `a note created by playwright 888-${RND_ID}`
      const noteRegexp = new RegExp(`.*${newNoteText}.*`)

      await page.getByRole('button', { name: 'new note' }).click()
      await page.getByRole('textbox').fill(newNoteText)
      await page.locator(dataTestId('submit-note')).click()

      await expect(page.locator(`li:text-is("${newNoteText}"):visible`))
    })
  })
})
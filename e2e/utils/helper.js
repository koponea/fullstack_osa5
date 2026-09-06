const config = require('../utils/config')
const { expect } = require('@playwright/test')

const DEFAULT_USER = {
    username: config.USERNAME_DEFAULT,
    password: config.PASSWORD_DEFAULT,
    name: config.USER_NAME_DEFAULT,
}

const NOTIFICATION_CLASS = { error: 'error', info: 'notification' }

const dataTestId = (locator) => `[data-testid=${locator}]`
const dataTestIdStartsWith = (locator) => `[data-testid^=${locator}]`

const genRndId = () => Math.floor(Math.random() * 1000000000).toString()

const login = async ({
    page,
    username,
    password,
}) => {
    await page.getByRole('button', { name: 'login' }).click()
    await page.getByLabel('username').fill(username)
    await page.getByLabel('password').fill(password)
    await page.getByTestId('submit-login').click()
}

const loginAndVerify = async ({
    page,
    username = config.USERNAME_DEFAULT,
    password = config.PASSWORD_DEFAULT,
    name = config.USER_NAME_DEFAULT,
}) => {
    console.log('logging in as:', username)
    await login({ page, username, password })
    expect(await page.getByText(`${name} logged in`)).toBeVisible()
}

const createNote = async (page, noteText) => {
    const noteRegexp = new RegExp(`.*${noteText}.*`)

    await page.getByRole('button', { name: 'new note' }).click()
    await page.getByRole('textbox').fill(noteText)
    await page.locator(dataTestId('submit-note')).click()

    await expect(page.getByText(noteRegexp)).toBeVisible()
}

export {
    createNote,
    dataTestId,
    dataTestIdStartsWith,
    genRndId,
    login,
    loginAndVerify,
    DEFAULT_USER,
    NOTIFICATION_CLASS
}
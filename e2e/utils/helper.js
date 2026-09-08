const config = require('../utils/config')
const { expect } = require('@playwright/test')
import { isRegExp } from 'lodash'

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
    await page.getByRole('button', { name: 'log in' }).click()
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

    //// ja täs kun kerran 

    expect(await page.locator(`${dataTestId('new-note')}`)).toBeVisible()
    const open = await page.locator(`${dataTestId('new-note')}:visible`)
    await open.click()
    await page.getByRole('textbox').fill(noteText)
    await page.locator(dataTestId('submit-note')).click()

    await expect(page.getByText(noteRegexp)).toBeVisible()
    await page.getByText('cancel').click()
}

const toTextMatchesCssPW = (prefix, regExp, suffix = '') => {
    // Escape \ and " for the css string
    // :text-matches() is The pseudo-class for regex 
    // matching, it takes the pattern as a quoted string
    const escSrc = regExp.source
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');
    const flags =
        regExp.flags.replace(/"/g, ''); // no quotes anyways

    return `${prefix}:text-matches("${escSrc}"${flags ? `, "${flags}"` : ''})${suffix}`;
}

const buildElementLocator = ({
    element = 'li',
    match, // string, RegExp
    suffix = '',
    partial = true
}) =>
    // :text(partialText) :text-is(exactText)    exact match is pw specific
    isRegExp(match) ?
        toTextMatchesCssPW(element, match, suffix)
        : partial
            ? `${element}:text("${match}")${suffix}`
            : `${element}:text-is("${match}")${suffix}`


const notificationBannerLocator = (
    match, // string, RegExp
    visibility = '',  // ':visible', ':hidden', ''
    partial = true
) =>
    buildElementLocator({
        element: '.notification', match, suffix: visibility, partial
    })

const blogTitleAuthorRegexp = (blog, notification = false) =>
    notification
        ? new RegExp(`.*${blog.title}.*by.*${blog.author}.*`)
        : new RegExp(`.*${blog.title} ${blog.author}.*`)

const submitBlog = async (page, blog) => {

    expect(await page.locator(`${dataTestId('crete-new-blog')}`))
    const open = await page.locator(`${dataTestId('create-new-blog')}:visible`)
    await open.click()

    await page.getByTestId('title-input').fill(blog.title)
    await page.getByTestId('author-input').fill(blog.author)
    await page.getByTestId('url-input').fill(blog.url)

    await page.locator(dataTestId('submit-blog')).click()
}

const createBlog = async (page, blog) => {

    const rowRegexp = blogTitleAuthorRegexp(blog)
    const bannerRegexp = blogTitleAuthorRegexp(blog, true)

    await submitBlog(page, blog)

    await page.getByText(rowRegexp).waitFor()
    await page.getByText(bannerRegexp).waitFor()

    expect(await page
        .locator(notificationBannerLocator(bannerRegexp, ':visible'))).toBeDefined()
    expect(await page.getByText(rowRegexp).waitFor())
    // tai esim 3:s nappula:
    // page.locator('li').filter({ hasText: noteText3rd }).getByRole('button')
}

const expandBlog = async (page, blog) => {
    const blogLoc = page.locator(dataTestIdStartsWith('blog-'))
        .filter({ hasText: blog.title })

    const expandButton = blogLoc.getByRole('button').filter({ hasText: 'view' })
    await expandButton.click()

    expect(blogLoc.getByRole('button').first()).toContainText('hide')
}

export {
    submitBlog,
    createBlog,
    createNote,
    dataTestId,
    dataTestIdStartsWith,
    expandBlog,
    genRndId,
    login,
    loginAndVerify,
    notificationBannerLocator,
    DEFAULT_USER,
    NOTIFICATION_CLASS
}
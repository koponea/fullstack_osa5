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
  createBlog,
} = require('../utils/helper')

const RGB_ERROR_RED = 'rgb(255, 0, 0)'
const RGB_NOTIFICATION_GREEN = 'rgb(0, 128, 0)'
const defaultBlog = {
  title: `A title by Playwright ${genRndId()}`,
  author: 'Oasis',
  url: 'https://fullstackopen.com/',
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset') // 3003
    await request.post('/api/users', { data: DEFAULT_USER })
    await page.goto('/')
    //console.log(`test user ${DEFAULT_USER.username} created`)
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


  describe('When logged in', () => {

    beforeEach(async ({ page }) =>
      await loginAndVerify({ page })
    )

    test('a new blog can be created', async ({ page }) => {
      const blog = { ...defaultBlog }

      await createBlog(page, blog)

      // smallest el in the row where the /.*text.*/ is visible
      expect(await page.locator(`li:text-is("${blog.title} by ${blog.author}"):visible`))

      const notificationBanner = page.locator('.notification')
      await expect(notificationBanner).toContainText(
        `a new blog ${blog.title} by ${blog.author} added`
      )
      await expect(notificationBanner).toHaveCSS('border-style', 'solid')
      await expect(notificationBanner).toHaveCSS('color', RGB_NOTIFICATION_GREEN)
    })
  })

  describe('when several blogs exists', () => {
    // rest of the data would be tested at UT for mix-ups
    const blogA = { ...defaultBlog, title: `Wonderwall A ${genRndId()}` }
    const blogB = { ...defaultBlog, title: `Wonderwall B ${genRndId()}` }
    const blogC = { ...defaultBlog, title: `Wonderwall C ${genRndId()}` }

    beforeEach(async ({ page }) =>
      await loginAndVerify({ page })
    )

    beforeEach(async ({ page }) => {
      // waitforia, ettei createt mene päällekkäin, kerkiää renderöidä
      //const blogLoc = dataTestIdStartsWith('blog')
      const blogLineRegexp = (blog) => new RegExp(`.*${blog.title} ${blog.author}.*`)

      await createBlog(page, blogA)
      await page.getByText(blogLineRegexp(blogA)).waitFor()
      await createBlog(page, blogB)
      await page.getByText(blogLineRegexp(blogB)).waitFor()
      await createBlog(page, blogC)
      await page.getByText(blogLineRegexp(blogC)).waitFor()
      // tai esim 3:s nappula:
      // page.locator('li').filter({ hasText: noteText3rd }).getByRole('button')
    })

    test('one of those can be modified by liking', async ({ page }) => {
      console.log('the fastest way: add blog-id to all buttons, apiquery the id')

      const likeLoc = dataTestIdStartsWith('like-button-') // do not know id

      const blogLoc = page.locator(dataTestIdStartsWith('blog-'))
        .filter({ hasText: blogB.title })     
        
      const expandButton = blogLoc.getByRole('button').filter({ hasText: 'view' }) 
      await expandButton.click()

      expect(blogLoc.getByRole('button').first()).toContainText('hide')

      await blogLoc.getByText(/^likes: (\s{0,})?\d{1,}/).waitFor() //single

      const likeButton = blogLoc.locator(likeLoc)
      await likeButton.click({ timeout: 20_000 })

      await blogLoc.getByText(/^likes:/).waitFor() //single
      await blogLoc.getByText(/^likes: 1like$/).waitFor()

      console.log('the fastest way: afterwards GET also the likes and verify')
    })
  })
})

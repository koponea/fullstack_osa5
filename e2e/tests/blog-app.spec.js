const config = require('../utils/config')
const {
  test,
  expect,
  beforeEach,
  describe,
} = require('@playwright/test')
const {
  createBlog,
  dataTestId,
  dataTestIdStartsWith,
  expandBlog,
  genRndId,
  likeTheBlog,
  login,
  loginAndVerify,
  nthBlogIsDefined,
  readBlogId,
  submitBlog,
  DEFAULT_USER,
  NOTIFICATION_CLASS,
} = require('../utils/helper')
import { toString } from 'lodash'

const RGB_ERROR_RED = 'rgb(255, 0, 0)'
const RGB_NOTIFICATION_GREEN = 'rgb(0, 128, 0)'
const DEFAULT_BLOG = {
  title: `A title by Playwright ${genRndId()}`,
  author: 'Oasis',
  url: 'https://fullstackopen.com/',
}
const USER_VIEWER = {
  username: 'viewer',
  password: 'viuviuviuviu',
  name: 'Viewerino',
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset') // 3003
    await request.post('/api/users', { data: DEFAULT_USER })
    await request.post('/api/users', { data: USER_VIEWER })
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

    test('Succeeds with correct credentials', async ({ page }) => {
      test.setTimeout(20_000) // login

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

    test('Fails with wrong credentials', async ({ page }) => {
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

    test('A new blog can be created', async ({ page }) => {
      const blog = { ...DEFAULT_BLOG }

      await submitBlog(page, blog)

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

  describe('When several blogs exists', () => {
    // rest of the data should be tested at UT for mix-ups
    const blogA = { ...DEFAULT_BLOG, title: `Wonderwall A ${genRndId()}` }
    const blogB = { ...DEFAULT_BLOG, title: `Wonderwall B ${genRndId()}` }
    const blogC = { ...DEFAULT_BLOG, title: `Wonderwall C ${genRndId()}` }
    const blogForDel = { ...DEFAULT_BLOG, title: `Wonderwall D ${genRndId()}` }

    beforeEach(async ({ page }) =>
      await loginAndVerify({ page })
    )

    beforeEach(async ({ page }) => {
      await createBlog(page, blogA)
      await createBlog(page, blogB)
      await createBlog(page, blogForDel)
      await createBlog(page, blogC)
    })

    test('One of those can be modified by liking', async ({ page }) => {
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

    test('One of those can be deleted', async ({ page }) => {
      const blog = { ...blogForDel }
      const dialogQ = `Remove blog ${blog.title} by ${blog.author} ?`

      // listener for the window.confirm
      page.on('dialog', async (dialog) => {
        console.log(dialog.type(), 'dialog:', dialog.message())
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toBe(dialogQ);
        await dialog.accept(); //  OK
      })

      const blogLoc = page.locator(dataTestIdStartsWith('blog-'))
        .filter({ hasText: blog.title })

      const countOfBlogs = await page.locator(dataTestIdStartsWith('blog-')).count()

      await expandBlog(page, test, blog)

      // maybe an api GET?
      page.on('response', data => {
        const resData = data._initializer // get some better way
        console.log('response, url', resData.url)
        console.log('response, status', resData.status)
        expect(resData.url).toEqual(expect.stringContaining('/api/blogs/'));
        expect(resData.status === '204') // delete ok
      });

      const deleteButton = blogLoc.getByRole('button')
        .filter({ hasText: 'remove' }) // single
      expect(await blogLoc.getByRole('button').filter({ hasText: 'remove' }).all()).toHaveLength(1)

      await deleteButton.click({ timeout: 20_000 }) // the listener wakes up

      // Ei, koska ei ole dialogikomponentti, pitää olla kuuntelija ylh
      // await page.getByRole('dialog').getByRole('button', {name: 'OK'}).click()

      const newCountOfBlogs = await page.locator(dataTestIdStartsWith('blog-')).count()
      expect(newCountOfBlogs === countOfBlogs - 1)

      const notificationBanner = page.locator('.notification')
      await expect(notificationBanner).toContainText(`Deleted ${blog.title}`)
      await expect(notificationBanner).toHaveCSS('color', RGB_NOTIFICATION_GREEN)

    })

    test('The non-creator cannot delete via UI', async ({ page }) => {
      const blog = { ...blogA }

      const blogLoc = page.locator(dataTestIdStartsWith('blog-'))
        .filter({ hasText: blog.title })

      await page.getByRole('button', { name: 'logout' }).click()
      await page.getByRole('button', { name: 'log in' }).waitFor()

      // these open directly when logged out
      await page.getByLabel('username').fill(USER_VIEWER.username)
      await page.getByLabel('password').fill(USER_VIEWER.password)
      console.debug('logging in as:', USER_VIEWER.username)
      await page.getByTestId('submit-login').click()
      expect(await page.getByText(`${USER_VIEWER.name} logged in`)).toBeVisible()

      await expandBlog(page, test, blog)

      expect(await blogLoc.getByRole('button').filter({ hasText: 'remove' })
        .all()).toHaveLength(0)
    })

    test('The blogs are always in ascening order regarding likes', async ({ page }) => {
      test.setTimeout(30_000) // all flapping around if narrow pipe

      const likeLoc = dataTestIdStartsWith('like-button-') // do not know blog.id yet

      // [A,B,C,D]
      let blogs = [{ ...blogA }, { ...blogB }, { ...blogC }, { ...blogForDel }]
      const titlesRegexpAtoD =
        blogs.map(blog => new RegExp(`^${blog.title} ${blog.author}`))


      // get blog id:s to blogs for test-dataid:s, be api's could b handy here
      console.log('The code looks a bit -CYPRESSY- to me as javascript :)')
      blogs[0].id = await readBlogId(page, blogs[0])
      blogs[1].id = await readBlogId(page, blogs[1])
      blogs[2].id = await readBlogId(page, blogs[2])
      blogs[3].id = await readBlogId(page, blogs[3])
      //console.log(blogs)

      // likes (hiding) and all blogs
      expect(await page.locator(likeLoc).all()).toHaveLength(4) // hiding buttons
      expect(await page.locator(dataTestIdStartsWith('blog-')).all()).toHaveLength(4)

      // expand all blogs, looping messes up
      // await page.getByTestId(`blog-${blogs[3].id}`).getByRole('button').first().click()
      await expandBlog(page, test, blogs[3])
      await expandBlog(page, test, blogs[2])
      await expandBlog(page, test, blogs[1])
      await expandBlog(page, test, blogs[0])

      /* CHECK: [A, B, D, C] is the creation order
      / COULD fail due to REST but should not since created now via UI so in page states
      / if this happens, then the page crashed & reloaded ??
      /
      / omg with these asyncs not stacked, cannot loop !!
      */
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[0], 0) // blogs -> order
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[1], 1)
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[3], 2)
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[2], 3)

      // like in random order, looping messes up
      await likeTheBlog(page, test, blogs[2])
      await likeTheBlog(page, test, blogs[1])

      await page.getByTestId(`blog-${blogs[0].id}`).getByText(/^likes: 0like$/).waitFor()
      expect(await page.locator(dataTestIdStartsWith('blog-'))
        .nth(2).getByText(new RegExp(`^${blogs[0].title} ${blogs[0].author}`))).toBeVisible()

      await likeTheBlog(page, test, blogs[3])
      await likeTheBlog(page, test, blogs[3])
      await likeTheBlog(page, test, blogs[2])
      await likeTheBlog(page, test, blogs[3])
      await page.getByText(/^likes: 3like$/).waitFor()

      console.log('CHECK likes and order, [D, C, B, A] after likes')
      const likeRegexp = [/^likes: 3like$/, /^likes: 2like$/, /^likes: 1like$/, /^likes: 0like$/]
      await nthBlogIsDefined(page, test, likeRegexp[0], 0) // count -> order
      await nthBlogIsDefined(page, test, likeRegexp[1], 1)
      await nthBlogIsDefined(page, test, likeRegexp[2], 2)
      await nthBlogIsDefined(page, test, likeRegexp[3], 3)

      await nthBlogIsDefined(page, test, titlesRegexpAtoD[3], 0) // blogs -> order
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[2], 1)
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[1], 2)
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[0], 3)
    })
  })
})

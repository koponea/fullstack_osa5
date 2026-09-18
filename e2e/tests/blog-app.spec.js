const config = require('../utils/config')
const {
  test,
  expect,
  beforeEach,
  describe,
} = require('@playwright/test')
const {
  blogTitleAuthorRegexp,
  createBlog,
  dataTestId,
  dataTestIdStartsWith,
  genRndId,
  landingHeadingRx,
  login,
  loginAndVerify,
  nthBlogIsDefined,
  gotoDetailsAndLike,
  readBlogId,
  submitBlog,
  waitForLikes,
  DEFAULT_USER,
  NOTIFICATION_CLASS,
} = require('../utils/helper')

const RGB_ERROR_RED = 'rgb(95, 33, 32)'
const RGB_NOTIFICATION_GREEN = 'rgb(30, 70, 32)'
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
const landingHeadElelment = page => page.getByRole('heading', { name: landingHeadingRx })

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset') // 3003
    await request.post('/api/users', { data: DEFAULT_USER })
    await request.post('/api/users', { data: USER_VIEWER })
    await page.goto('/')
    //console.log(`test user ${DEFAULT_USER.username} created`)
  })

  test('Login form is shown', async ({ page }) => {
    await expect(landingHeadElelment(page)).toBeVisible()

    await page.getByRole('link', { name: /^login$/ }).click()

    expect(await page.getByTestId('submit-login')).toBeVisible()

    expect(await page.getByLabel('username')).toBeVisible()
    expect(await page.getByLabel('password')).toBeVisible()

    const logoutButton = await page.getByTestId('nav-logout-button')
    expect(logoutButton).toBeHidden()
  })

  describe('Login', () => {

    test('Succeeds with correct credentials', async ({ page }) => {
      test.setTimeout(20_000) // login
      console.log(config.USERNAME_DEFAULT, config.USER_NAME_DEFAULT)

      await page.getByTestId('nav-login').click()

      await page.getByLabel('username').fill(config.USERNAME_DEFAULT)
      await page.getByLabel('password').fill(config.PASSWORD_DEFAULT)

      await page.getByTestId('submit-login').click()
      await expect(await landingHeadElelment(page)).toBeVisible() // wait for login

      // will this ever be again?
      //await expect(page.getByText(`${config.USER_NAME_DEFAULT} logged in`)).toBeVisible()

      const logoutButton = await page.getByTestId('nav-logout-button')
      expect(logoutButton).toBeVisible()
      expect(logoutButton).toHaveText(/logout/)

      expect(page.getByTestId(NOTIFICATION_CLASS.error)).not.toBeVisible()
      expect(page.getByTestId(NOTIFICATION_CLASS.info)).not.toBeVisible()

      expect(await page.locator(dataTestId('nav-create'))).toBeVisible({ timeout: 10_000 })
    })

    test('Fails with wrong credentials', async ({ page }) => {
      await login({ page, ...DEFAULT_USER, password: 'wrong' })

      await expect(page.getByText('wrong username or password')).toBeVisible()

      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('wrong username or password')
      await expect(errorDiv).toHaveCSS('color', RGB_ERROR_RED)
      const logoutButton = await page.getByTestId('nav-logout-button')
      expect(logoutButton).toBeHidden()
    })
  })

  describe('When not logged in', () => {

    beforeEach(async ({ page }) => {
      await loginAndVerify({ page })
      await submitBlog(page, { ...DEFAULT_BLOG })
      await expect(await page.getByTestId('blogs-header')).toBeVisible()
      await page.getByTestId('nav-logout-button').click()
      await page.goto('/')
    })

    test('A blog can be viewed and opening link to another tab works', async ({ page }) => {
      const blog = { ...DEFAULT_BLOG }

      await expect(landingHeadElelment(page)).toBeVisible()
      await page.getByTestId('nav-login').waitFor()

      const blogLinkInList = page.locator(dataTestIdStartsWith('blog-'))
        .filter({ hasText: blog.title })
      await blogLinkInList.click()

      const detailsHeadElelment =
        await page.getByRole('heading', { name: new RegExp(`^${blog.title}$`) })
      await expect(detailsHeadElelment).toBeVisible()

      const deleteButtonLoc = dataTestIdStartsWith('delete-button-')
      expect(await page.locator(deleteButtonLoc).all()).toHaveLength(1)
      expect(await page.locator(deleteButtonLoc)).toBeHidden()

      const likeButtonLoc = dataTestIdStartsWith('like-button-')
      expect(await page.locator(likeButtonLoc).all()).toHaveLength(1)
      expect(await page.locator(likeButtonLoc)).toBeHidden()

      await waitForLikes(page, '\\d{1,}') // any visible

      // check the use of the url to another tab
      await page.getByRole('link', { name: new RegExp(`^${blog.url}$`) })
        .waitFor({ state: 'visible' })
      
      // Start waiting for new page before clicking. Note no await.
      // Create a new incognito browser context
      const pagePromise = page.context().waitForEvent('page');
      await page.getByRole('link', { name: new RegExp(`^${blog.url}$`) }).click()

      const linkedPage = await pagePromise

      await expect(linkedPage).toHaveURL(blog.url);
      await linkedPage.getByText(/aloita kurssi/i).waitFor({ state: 'visible' })
      console.log(await linkedPage.title())
    })
  })

  describe('When logged in', () => {

    beforeEach(async ({ page }) =>
      await loginAndVerify({ page })
    )

    test('A new blog can be created', async ({ page }) => {
      const blog = { ...DEFAULT_BLOG }

      await submitBlog(page, blog)
      await expect(await page.getByTestId('blogs-header')).toBeVisible()


      // smallest el in the row where the /.*text.*/ is visible
      expect(await page.locator(`li:text-is("${blog.title} by ${blog.author}"):visible`))

      const notificationBanner = page.locator('.success')
      await expect(notificationBanner).toContainText(
        `a new blog ${blog.title} by ${blog.author} added`
      )
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

      const blogBRegexp = blogTitleAuthorRegexp(blogB)
      expect(await page.getByRole('link', { name: blogBRegexp }).waitFor())
      await page.getByRole('link', { name: blogBRegexp }).click()

      const detailsHeadElelment =
        await page.getByRole('heading', { name: new RegExp(`^${blogB.title}$`) })
      await expect(detailsHeadElelment).toBeVisible()
      await expect(page.locator(likeLoc)).toBeVisible()

      await page.getByText(/^\d{1,}(\s{1,})?likes.*/).waitFor() // data loaded

      await page.locator(likeLoc).click({ timeout: 20_000 })

      await page.getByText(/.*likeslike.*/).waitFor() // single stable
      await page.getByText(/^1 likes.*/).waitFor()

      console.log('the fastest way: afterwards GET also the likes and verify')
    })

    test('One of those can be deleted', async ({ page }) => {
      const blog = { ...blogForDel }
      const dialogQ = `Remove blog ${blog.title} by ${blog.author} ?`
      const deleteLoc = dataTestIdStartsWith('delete-button-') // do not know id

      // listener for the window.confirm
      page.on('dialog', async (dialog) => {
        console.log(dialog.type(), 'dialog:', dialog.message())
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toBe(dialogQ);
        await dialog.accept();
      })

      const countOfBlogs = await page.locator(dataTestIdStartsWith('blog-')).count()

      // to details to delete the blog
      const blogRegexp = blogTitleAuthorRegexp(blog)
      expect(await page.getByRole('link', { name: blogRegexp }).waitFor())
      await page.getByRole('link', { name: blogRegexp }).click()

      // now wait for delete response, maybe an api GET? 
      page.on('response', data => {
        const resData = data._initializer // get some better way
        console.log('response, url', resData.url)
        console.log('response, status', resData.status)
        expect(resData.url).toEqual(expect.stringContaining('/api/blogs/'));
        expect(resData.status === '204') // delete ok
      });

      const detailsHeadElelment =
        await page.getByRole('heading', { name: new RegExp(`^${blog.title}$`) })
      await expect(detailsHeadElelment).toBeVisible()

      await page.getByText(/.*likes.*remove.*/).waitFor() // stable, has rights
      await expect(page.locator(deleteLoc)).toBeVisible()
      await page.locator(deleteLoc).click({ timeout: 20_000 })

      // Ei, koska ei ole dialogikomponentti, pitää olla kuuntelija ylh
      // await page.getByRole('dialog').getByRole('button', {name: 'OK'}).click()

      const newCountOfBlogs = await page.locator(dataTestIdStartsWith('blog-')).count()
      expect(newCountOfBlogs === countOfBlogs - 1)

      const notificationBanner = page.locator('.success')
      await expect(notificationBanner).toContainText(`Deleted ${blog.title}`)
      await expect(notificationBanner).toHaveCSS('color', RGB_NOTIFICATION_GREEN)
    })

    test('The non-creator cannot delete via UI', async ({ page }) => {
      const blog = { ...blogA }

      const blogLinkInList = page.locator(dataTestIdStartsWith('blog-'))
        .filter({ hasText: blog.title })

      await page.getByTestId('nav-logout-button').click()

      await page.getByTestId('nav-login').waitFor()
      await page.getByTestId('nav-login').click()
      await loginAndVerify({ page, ...USER_VIEWER })
      console.debug('logging in as:', USER_VIEWER.username)

      await page.getByTestId('nav-logout-button').waitFor()

      await blogLinkInList.click()

      const detailsHeadElelment =
        await page.getByRole('heading', { name: new RegExp(`^${blog.title}$`) })
      await expect(detailsHeadElelment).toBeVisible()

      const deleteButtonLoc = dataTestIdStartsWith('delete-button-')
      expect(await page.locator(deleteButtonLoc).all()).toHaveLength(1)
      expect(await page.locator(deleteButtonLoc)).toBeHidden()
    })

    test('The blogs are always in ascening order regarding likes', async ({ page }) => {
      test.setTimeout(30_000) // all flapping around if narrow pipe

      const likeLoc = dataTestIdStartsWith('like-button-') // do not know blog.id yet

      // [A,B,C,D]
      let blogs = [{ ...blogA }, { ...blogB }, { ...blogC }, { ...blogForDel }]
      const titlesRegexpAtoD =
        blogs.map(blog => blogTitleAuthorRegexp(blog))

      // get blog id:s to blogs for test-dataid:s, be api's could b handy here
      console.log('The code looks a bit -CYPRESSY- to me as javascript :)')
      blogs[0].id = await readBlogId(page, blogs[0])
      blogs[1].id = await readBlogId(page, blogs[1])
      blogs[2].id = await readBlogId(page, blogs[2])
      blogs[3].id = await readBlogId(page, blogs[3])
      //console.log(blogs)

      expect(await page.locator(dataTestIdStartsWith('blog-')).all()).toHaveLength(4)

      /* CHECK: [A, B, D, C] is the creation order
      / COULD fail due to REST but should not since created now via UI so in page states
      / if this happens, then the page crashed & reloaded
      /
      / omg with these asyncs not stacked, cannot loop !!
      */
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[0], 0) // blogs -> order
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[1], 1)
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[3], 2)
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[2], 3)

      // like in random order, looping messes up
      await gotoDetailsAndLike(page, test, blogs[2])
      await waitForLikes(page, 1)
      await gotoDetailsAndLike(page, test, blogs[1])
      await waitForLikes(page, 1)

      await page.getByTestId('nav-blogs').click()
      expect(await page.locator(dataTestIdStartsWith('blog-'))
        .nth(2).getByText(titlesRegexpAtoD[0])).toBeVisible()

      await gotoDetailsAndLike(page, test, blogs[3])
      await gotoDetailsAndLike(page, test, blogs[3])
      await waitForLikes(page, 2)
      await gotoDetailsAndLike(page, test, blogs[2])
      await waitForLikes(page, 2)
      await gotoDetailsAndLike(page, test, blogs[3])
      await waitForLikes(page, 3)

      await page.getByTestId('nav-blogs').click()

      console.log('CHECK order, [D, C, B, A] after likes')

      await nthBlogIsDefined(page, test, titlesRegexpAtoD[3], 0) // blogs -> order
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[2], 1)
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[1], 2)
      await nthBlogIsDefined(page, test, titlesRegexpAtoD[0], 3)
    })
  })
})

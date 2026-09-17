import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  const blog = {
    title: 'Component testing is ... react',
    author: 'K Kiehkura',
    url: 'https://fullstackopen.com/osa5/react_sovellusten_testaaminen',
    likes: '19840374',
    creator: 'Aila K',
    id: '6a9ad69b43a332b852483f49', // only for testid here
  }

  describe('rendering tests', () => {

    describe('when user is logged in', () => {
      beforeEach(() => {
        render(<Blog key={blog.id} blog={blog}
          showDeleteButton={{ display: '' }} // show, the creator. Will not print '' attrs
          showLikeButton={{ display: '' }}  // show, logged in
        />)
      })

      //test('renders content and hides invisibles', async () => {
      test('renders content and shows data', async () => {

        await screen.findByTestId(`blog-details-${blog.id}`)

        expect(screen.getByText('K Kiehkura: Component testing is ... react')).toBeDefined()
        expect(screen.queryByText('K Kiehkura', { exact: false })).toBeVisible()

        const likes = screen.queryByText(/.*19840374.*/)
        //expect(likes).not.toBeVisible()
        expect(likes).toBeDefined()
        expect(likes).toBeVisible()

        const url = screen.getByText(blog.url, { exact: false })
        //expect(url).not.toBeVisible()
        expect(url).toBeDefined()
        expect(url).toBeVisible()

        screen.debug(likes)
        screen.debug(url)
      })

      test('renders and shows the full blog and buttons', async () => {
        //const user = userEvent.setup()
        // esim lähteekö delete-kutsu?

        await screen.findByTestId(`blog-details-${blog.id}`)

        expect(await screen.findByText(blog.author, { exact: false })).toBeVisible()
        expect(screen.getByText(blog.creator, { exact: false })).toBeVisible()

        /*const showButton = await screen.findByText('show')
        await user.click(showButton)

        expect(await screen.findByText(blog.author, { exact: false })).toBeVisible()
        expect(screen.getByText(blog.creator)).toBeVisible()*/

        const deleteButton = await screen.findByTestId(`delete-button-${blog.id}`)

        const likeButton = await screen.findByTestId(`like-button-${blog.id}`)
        const likes = await screen.findByText(/^likes (\s{0,})?\d{1,}/)
        screen.debug(likes)
        const url = await screen.findByText(blog.url, { exact: false })

        expect(deleteButton).toBeVisible()
        expect(deleteButton.textContent).toBe('remove')

        expect(likeButton).toBeVisible()
        expect(likeButton.textContent).toBe('like')
        expect(likes).toBeVisible()
        expect(likes.textContent).toContain(blog.likes)
        expect(url).toBeVisible()
        expect(screen
          .getByText('K Kiehkura: Component testing is ... react'))
          .toBeVisible()
        expect(screen.getByText(blog.creator, { exact: false })).toBeVisible()

        /*
        const hideButton = screen.queryByText('hide')
        await user.click(hideButton)

        expect(screen.getByText(
          'Component testing is ... react K Kiehkura'))
          .toBeVisible()
        expect(likes).not.toBeVisible()
        expect(url).not.toBeVisible()*/

        screen.debug(likes)
        screen.debug(url)
        screen.debug()
      })
    })

    describe('when no logged in user', () => {
      beforeEach(() => {
        render(<Blog key={blog.id} blog={blog}
          showDeleteButton={{ display: 'none' }} // not the creator
          showLikeButton={{ display: 'none' }} // user not logged in
        />)
      })

      test('renders content and shows data', async () => {

        await screen.findByTestId(`blog-details-${blog.id}`)

        expect(screen.getByText('K Kiehkura: Component testing is ... react')).toBeDefined()
        expect(screen.queryByText('K Kiehkura', { exact: false })).toBeVisible()

        const likes = screen.queryByText(/.*19840374.*/)
        //expect(likes).not.toBeVisible()
        expect(likes).toBeDefined()
        expect(likes).toBeVisible()

        const url = screen.getByText(blog.url, { exact: false })
        //expect(url).not.toBeVisible()
        expect(url).toBeDefined()
        expect(url).toBeVisible()

        screen.debug(likes)
        screen.debug(url)
      })

      test('renders and shows the full blog but hides buttons', async () => {
        //const user = userEvent.setup()

        await screen.findByTestId(`blog-details-${blog.id}`)

        expect(await screen.findByText(blog.author, { exact: false })).toBeVisible()
        expect(screen.queryByText(blog.creator, { exact: false })).toBeVisible()

        /*const showButton = await screen.findByText('show')
        await user.click(showButton)

        expect(await screen.findByText(blog.author, { exact: false })).toBeVisible()
        expect(screen.getByText(blog.creator)).toBeVisible()*/

        //const likes = await screen.findByText(/^(\s{0,})?\d{1,}/)
        const likes = await screen.findByText(/likes(\s{1,})?\d{1,}.*/) //button!!

        screen.debug(likes)
        const url = await screen.findByText(blog.url, { exact: false })

        const deleteButtons = screen.queryAllByTestId(`delete-button-${blog.id}`)
        expect(deleteButtons).toHaveLength(1)
        expect(deleteButtons[0]).not.toBeVisible()

        const likeButtons = screen.queryAllByTestId(`like-button-${blog.id}`)
        expect(likeButtons).toHaveLength(1)
        expect(likeButtons[0]).not.toBeVisible()

        expect(likes).toBeVisible()
        expect(likes.textContent).toContain(blog.likes)
        expect(url).toBeVisible()
        expect(screen
          .getByText('K Kiehkura: Component testing is ... react'))
          .toBeVisible()
        expect(screen.getByText(blog.creator, { exact: false })).toBeVisible()

        /*const hideButton = screen.queryByText('hide')
        //await user.click(hideButton)

        expect(screen.getByText(
          'Component testing is ... react K Kiehkura'))
          .toBeVisible()
        expect(likes).not.toBeVisible()
        expect(url).not.toBeVisible()*/

        screen.debug(likeButtons)
        screen.debug(likes)
        screen.debug(url)
        screen.debug()
      })
    })
  })

  describe('tests with reactions', () => {

    test('like button reacts when user logged in', async () => {
      const mockHandler = vi.fn()
      render(<Blog key={blog.id} blog={blog} onLike={mockHandler}
        showDeleteButton={{ display: 'none' }} // not the creator
        showLikeButton={{ display: '' }}  // show, user logged in
      />)

      const user = userEvent.setup()
      expect(await screen.findByTestId(`blog-details-${blog.id}`))
        .toBeDefined()

      /*
      const showButton = await screen.findByText('show')
      await user.click(showButton)*/
      expect(screen.getByText(blog.creator, { exact: false })).toBeVisible()

      const likeButton = await screen.findByTestId(`like-button-${blog.id}`)
      const likeElement = await screen.findByText(/^likes (\s{0,})?\d{1,}/)
      screen.debug(likeElement)

      expect(likeElement.textContent).toContain(blog.likes)

      expect(likeButton).toBeVisible()
      await user.click(likeButton)
      await user.click(likeButton)

      const regex = new RegExp('^likes\\s{1,}\\d{1,}like$')
      expect(await screen.findByTestId(`like-button-${blog.id}`).textContent).toContain(regex)
      expect(await screen.findByTestId(`like-button-${blog.id}`)).toBeVisible()

      expect(mockHandler.mock.calls).toHaveLength(2)

      screen.debug((await screen.findByTestId(`like-button-${blog.id}`)).parentElement)
      screen.debug((await screen.findByTestId(`delete-button-${blog.id}`)).parentElement)
    })
  })
})

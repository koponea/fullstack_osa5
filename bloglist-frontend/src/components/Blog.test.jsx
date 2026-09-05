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
  beforeEach(() => {
    render(<Blog key={blog.id} blog={blog} />)
  })

  test('renders content and hides invisibles', async () => {

    await screen.findByTestId(`blog-${blog.id}`)

    expect(screen.getByText('Component testing is ... react K Kiehkura')).toBeDefined()
    expect(screen.queryByText('K Kiehkura', { exact: false })).toBeVisible()

    const likes = screen.queryByText(/.*19840374.*/)
    expect(likes).not.toBeVisible()
    expect(likes).toBeDefined()

    const url = screen.getByText(blog.url, { exact: false })
    expect(url).not.toBeVisible()
    expect(url).toBeDefined()

    screen.debug(likes)
    screen.debug(url)
  })

  test('renders and shows at first invisibles', async () => {
    const user = userEvent.setup()

    await screen.findByTestId(`blog-${blog.id}`)

    expect(await screen.findByText(blog.author, { exact: false })).toBeVisible()
    expect(screen.queryByText(blog.creator)).not.toBeVisible()

    const showButton = await screen.findByText('view')
    await user.click(showButton)

    expect(await screen.findByText(blog.author, { exact: false })).toBeVisible()
    expect(screen.getByText(blog.creator)).toBeVisible()

    const likeButton = await screen.findByTestId('like-button')
    const likes = await screen.findByText(/^likes: (\s{0,})?\d{1,}/)
    screen.debug(likes)
    const url = await screen.findByText(blog.url, { exact: false })

    expect(likeButton).toBeVisible()
    expect(likeButton.textContent).toBe('like')
    expect(likes).toBeVisible()
    expect(likes.textContent).toContain(blog.likes)
    expect(url).toBeVisible()
    expect(screen
      .getByText('Component testing is ... react K Kiehkura'))
      .toBeVisible()
    expect(screen.getByText(blog.creator)).toBeVisible()

    const hideButton = screen.queryByText('hide')
    await user.click(hideButton)

    expect(screen.getByText(
      'Component testing is ... react K Kiehkura'))
      .toBeVisible()
    expect(likes).not.toBeVisible()
    expect(url).not.toBeVisible()

    screen.debug(likes)
    screen.debug(url)
    screen.debug()
  })
})
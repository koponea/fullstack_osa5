import { render, screen } from '@testing-library/react'
import Blog from './Blog'

test('renders content and hides invisibles', () => {
  const blog = {
    title: 'Component testing is ... react',
    author: 'K Kiehkura',
    url: 'https://fullstackopen.com/osa5/react_sovellusten_testaaminen',
    likes: '19840374',
    creator: 'Aila K',
    id: '6a9ad69b43a332b852483f49', // not needed
  }

  render(<Blog key={blog.id} blog={blog} />)

  expect(screen.getByText('Component testing is ... react K Kiehkura')).toBeDefined()
  expect(screen.queryByText('K Kiehkura', { exact: false })).toBeDefined()

  const likes = screen.queryByText('19840374', { exact: false })
  expect(likes).not.toBeVisible()
  expect(likes).toBeDefined()

  const url = screen.getByText(blog.url, { exact: false })
  expect(url).not.toBeVisible()
  expect(url).toBeDefined()

  screen.debug(likes)
  screen.debug(url)
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import BlogForm from './BlogForm'

describe('<BlogForm />', () => {
  const newBlog = {
    title: 'Testing is ... react', // 20
    author: 'K Kiehkura', //10
    url: 'https://fs/osa5/test', //20
    likes: '19840374',
    creator: 'Aila K',
    id: '6a9ad69b43a332b852483f49', // only for testid here
  }

  describe('tests with reactions', () => {

    test('updates parent state and submits', async () => {
      const addBlog = vi.fn()
      const setTitle = vi.fn()
      const setAuthor = vi.fn()
      const setUrl = vi.fn()

      render(<BlogForm
        addBlog={addBlog}
        setTitle={setTitle}
        setAuthor={setAuthor}
        setUrl={setUrl}
      />)

      const user = userEvent.setup()

      const blogForm = await screen.findByTestId('create-blog-form')
      const titleInput = await screen.findByTestId('title-input')
      const authorInput = await screen.findByTestId('author-input')
      const urlInput = await screen.findByTestId('url-input')
      screen.debug(blogForm)

      await user.type(titleInput, newBlog.title)
      await user.type(authorInput, newBlog.author)
      await user.type(urlInput, newBlog.url)

      const submit = await screen.findByText('create')
      await user.click(submit)

      /**
      * In the App.jsx - the addBlog gets an event, and reads directly
      * from the page stateful data on what the form wrote to them.
      * The test will therefore check the calls to the field add
      * functions, used by the fields for the data. So cannot use
      * here toHaveBeenCalledWith etc to the event in addBlog
      *
      * Yes. a bit different approach to the blogform,
      * will probably refactor later to the regular to have the
      * calls in the App.jsx side handle-function via param
      */

      expect(setTitle.mock.calls).toHaveLength(20)
      expect(setTitle.mock.calls[newBlog.title.length - 1])
        .toStrictEqual([newBlog.title])
      expect(setTitle).toHaveBeenCalledWith(newBlog.title)

      expect(setAuthor.mock.calls).toHaveLength(10)
      expect(setAuthor.mock.calls[newBlog.author.length - 1])
        .toStrictEqual([newBlog.author])
      expect(setAuthor).toHaveBeenCalledWith(newBlog.author)


      expect(setUrl.mock.calls).toHaveLength(20)
      expect(setUrl.mock.calls[newBlog.url.length - 1])
        .toStrictEqual([newBlog.url])
      expect(setUrl).toHaveBeenCalledWith(newBlog.url)


      expect(addBlog.mock.calls).toHaveLength(1)
      expect(addBlog.mock.calls[0][0].type).toBe('submit') // event
    })
  })
})

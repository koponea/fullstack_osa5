
import { Button, TextField } from './StyledComponents'

const BlogForm = (props) => {
  const {
    title,
    author,
    addBlog,
    url,
    setTitle,
    setAuthor,
    setUrl,
    submitLabel = 'create',
  } = props

  return (
    <form data-testid="create-blog-form" onSubmit={addBlog} >
      <div>
        <h2>create new</h2>
        <div>
          <label htmlFor="titleInput" >
            <TextField
              placeholder="title"
              label="title"
              data-testid="title-input"
              id="titleInput"
              value={title}
              onChange={({ target }) => setTitle(target.value)}
            />
          </label>
        </div>

        <div>
          <label htmlFor="authorInput" >
            <TextField
              placeholder="author"
              label="author"
              data-testid="author-input"
              id="authorInput"
              value={author}
              onChange={({ target }) => setAuthor(target.value)}
            />
          </label>
        </div>

        <div>
          <label htmlFor="urlInput">
            <TextField
              placeholder="url"
              label="url"
              data-testid="url-input"
              id="urlInput"
              value={url}
              onChange={({ target }) => setUrl(target.value)}
            />
          </label>
        </div>
        <p>
          <Button type="submit" data-testid="submit-blog">{submitLabel} </Button>
        </p>
      </div>
    </form>
  )
}

export default BlogForm

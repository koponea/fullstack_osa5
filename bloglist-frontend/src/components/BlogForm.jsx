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
                        title:
            <input
              data-testid="title-input"
              id="titleInput"
              value={title}
              onChange={({ target }) => setTitle(target.value)}
            />
          </label>
        </div>

        <div>
          <label htmlFor="authorInput" >
                        author:
            <input
              data-testid="author-input"
              id="authorInput"
              value={author}
              onChange={({ target }) => setAuthor(target.value)}
            />
          </label>
        </div>

        <div>
          <label htmlFor="urlInput">
                        url:
            <input
              data-testid="url-input"
              id="urlInput"
              value={url}
              onChange={({ target }) => setUrl(target.value)}
            />
          </label>
        </div>
        <button type="submit" data-testid="submit">{submitLabel} </button>
      </div>
    </form>
  )
}

export default BlogForm

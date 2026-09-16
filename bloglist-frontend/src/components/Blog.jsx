import Togglable from './Togglable'

const blogStyle = {
  paddingTop: 10,
  paddingLeft: 2,
  border: 'solid',
  borderWidth: 1,
  marginBottom: 5
}

const Blog = ({ blog, blogRef, onLike, onDelete, showDeleteButton, togglable = true }) => {
  const testId = `blog-${blog.id}` // the id is not secret outside
  const buttonTestId = `like-button-${blog.id}`

  const details = () => (
    <>
      <div>url: {blog.url}</div>
      <div>likes: {blog.likes ? blog.likes : 0}
        <button onClick={onLike} data-testid={buttonTestId}>like</button>
      </div>
      <div>{blog.creator}</div>
      <button style={showDeleteButton} onClick={onDelete}>remove</button>
    </>
  )

  const togglableDetails = () => (
    <Togglable buttonLabel='show' hideLabel='hide' ref={blogRef} buttonPlacing='immediate'>
      {details()}
    </Togglable>)

  return (
    < div data-testid={testId} style={blogStyle}>
      {blog.title} {blog.author}
      {togglable && togglableDetails()}
      {!togglable && details()}
    </div >
  )
}

export default Blog
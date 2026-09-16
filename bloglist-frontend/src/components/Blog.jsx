import Togglable from './Togglable'

const blogStyle = {
  paddingTop: 10,
  paddingLeft: 2,
  border: 'solid',
  borderWidth: 1,
  marginBottom: 5
}

const Blog = ({ blog, blogRef = null, onLike, onDelete, showDeleteButton, showLikeButton }) => {
  if (!blog) return null  // deleted
  const testId = `blog-${blog.id}` // the id is not secret outside
  const buttonTestId = `like-button-${blog.id}`

  const details = () => (
    <>
      <div>{blog.url}</div>
      <div>likes {blog.likes ? blog.likes : 0}
        <button style={showLikeButton} onClick={onLike} data-testid={buttonTestId}>like</button>
      </div>
      <div>Added by {blog.creator}</div>
      <button style={showDeleteButton} onClick={onDelete}>remove</button>
    </>
  )

  const togglableDetails = () => (
    <Togglable buttonLabel='show' hideLabel='hide' ref={blogRef} buttonPlacing='immediate'>
      {details()}
    </Togglable>)

  return (
    <>
      {blogRef && (
        <div data-testid={testId} style={blogStyle}>
          <>{blog.title} {blog.author}</>
          {togglableDetails()}
        </div >)
      }
      {!blogRef && (
        <>
          <h2>{blog.author}: {blog.title}</h2>
          <div data-testid={testId} >
            {details()}
          </div >
        </>)
      }
    </>
  )
}

export default Blog
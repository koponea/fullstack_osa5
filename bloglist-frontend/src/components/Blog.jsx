import Togglable from './Togglable'

const blogStyle = {
  paddingTop: 10,
  paddingLeft: 2,
  border: 'solid',
  borderWidth: 1,
  marginBottom: 5
}

const Blog = ({ blog, blogRef, onLike, onDelete }) => {

  return (
    < div style={blogStyle}>

      {blog.title} {blog.author}

      <Togglable buttonLabel='view' hideLabel='hide' ref={blogRef} buttonPlacing='immediate'>

        <div>url: {blog.url}</div>
        <div>likes: {blog.likes ? blog.likes : 0}
          <button onClick={onLike} data-testid="like-button">like</button>
        </div>
        <div>{blog.creator}</div>
  
        <button onClick={onDelete}>remove</button>

      </Togglable>

    </div >
  )
}

export default Blog
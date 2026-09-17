import { useParams } from 'react-router-dom'

/*
const blogStyle = {
  paddingTop: 10,
  paddingLeft: 2,
  border: 'solid',
  borderWidth: 1,
  marginBottom: 5
}*/

const Blog = ({ blog, onLike, onDelete, showDeleteButton, showLikeButton, notifyUser }) => {
  const paramId = useParams().id

  if (!blog) return null // deleted
  const id = paramId || blog.id ? blog.id : null

  const handleDelete = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author} ?`)) {
      onDelete(blog)
    } else {
      console.log(`id ${id}: ${blog.title} delete canceled`)
      notifyUser(`Delete of ${blog.title} canceled`)
    }
  }

  const details = () => (
    <>
      <div>{blog.url}</div>
      <div>likes {blog.likes ? blog.likes : 0}
        <button style={showLikeButton} onClick={onLike} data-testid={`like-button-${id}`}>like</button>
      </div>
      <div>Added by {blog.creator}</div>
      <button style={showDeleteButton} onClick={handleDelete} data-testid={`delete-button-${id}`}>remove</button>
    </>
  )

  return (
    <>
      <div >
        <h2>{blog.author}: {blog.title}</h2>
        <div data-testid={`blog-details-${id}`}>
          {details()}
        </div >
      </div>
    </>
  )
}

export default Blog
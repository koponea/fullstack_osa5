import { useParams } from 'react-router-dom'
import { Button } from './StyledComponents'
import { Card, Container } from '@mui/material'


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

  const style = ({
    padding: 5,
    border: '10px solid transparent'
  })
  const authorStyle = ({
    'font-size': 'larger',
    'font-weight': 'bold'
  })

  const details = () => (

    <Container style={style}>
      <>
        <div style={authorStyle} >by {blog.author}</div>
        <a href={blog.url} target="_blank" rel="noopener noreferrer">
          {blog.url}
        </a>
        <div>Added by {blog.creator} </div>
        <div>{blog.likes ? blog.likes : 0} likes
          <Button style={showLikeButton} onClick={onLike} data-testid={`like-button-${id}`}>like</Button>
          <Button style={showDeleteButton} onClick={handleDelete} data-testid={`delete-button-${id}`}>remove</Button>
        </div>
      </>
    </Container>
  )

  return (
    <>
      <Card elevation={2} style={style}>
        <h2>{blog.title}</h2>
        <div data-testid={`blog-details-${id}`}>
          {details()}
        </div >
      </Card>
    </>
  )
}

export default Blog
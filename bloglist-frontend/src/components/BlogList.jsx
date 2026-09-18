import { Link } from 'react-router-dom'
import { Container, } from '@mui/material'

const BlogList = ({ blogs }) => {

  if (!blogs) return null // not loaded yet

  return (
    <div>
      <h2 data-testid="blogs-header">blogs</h2>
      <Container>
        {blogs.map(({ id, title, author }) =>
          <li key={id}>
            <Link data-testid={`blog-${id}`} to={`/blogs/${id}`}>
              {title} by {author}
            </Link>
          </li>
        )}
      </Container>

    </div>
  )
}

export default BlogList
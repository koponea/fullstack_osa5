import { Link } from 'react-router-dom'

const BlogList = ({ blogs }) => {

  if (!blogs) return null // not loaded yet

  return (
    <div>
      <h2>blogs</h2>
      {blogs.map((blog) =>
        <li key={blog.id}>
          <Link data-testid={`blog-${blog.id}`} to={`/blogs/${blog.id}`}>
            {blog.title} by {blog.author}
          </Link>
        </li>
      )}
    </div>
  )
}

export default BlogList
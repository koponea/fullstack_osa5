const Blog = ({ blog }) => (
  // why no url?
  <div>
    {blog.title} {blog.author}
  </div>  
)

export default Blog
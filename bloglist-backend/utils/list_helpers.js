const { toArray } = require('lodash')
const logger = require('./logger')

const dummy = (blogs) => {
  logger.info('dummy, blogs:', blogs)
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + (blog.likes || 0)
  }
  return blogs && blogs.length !== 0 ?
    blogs.reduce(reducer, 0) : 0
}

const favoriteBlog = (blogs) => {
  const reducer = (favourite, blog) => {
    const favouriteLikes = favourite.likes || 0
    const likes = blog.likes || 0
    // last handled favourite
    return favouriteLikes > likes ? favourite : blog
  }
  if (blogs && blogs.length === 1) return blogs[0]
  return blogs && blogs.length !== 0 ?
    blogs.reduce(reducer, blogs[0]) : null
}

const mostBlogs = blogs => {
  const authors = blogs ? toArray(new Set(blogs.map(blog => blog.author ? blog.author : ''))) : []
  let bloggers = []

  authors.forEach(author => {
    let blogger = { author, blogs: 0 }
    blogs.forEach(blog => {
      blog.author && blog.author === author && ++blogger.blogs
      !blog.author && author === '' && ++blogger.blogs
    })
    bloggers.push(blogger)
  })
  logger.info('debug: mostBlogs bloggers:', bloggers)
  const reducer = (mostActive, blogger) => {
    // last handled blogger
    return mostActive.blogs > blogger.blogs ? mostActive : blogger
  }

  if (blogs && blogs.length === 1)
    return { author: blogs[0].author ? blogs[0].author : '', blogs: 1 }
  return blogs && blogs.length !== 0 ?
    bloggers.reduce(reducer, blogs[0]) : null
}

const mostLikes = blogs => {
  const authors = blogs ? toArray(new Set(blogs.map(blog => blog.author ? blog.author : ''))) : []
  let bloggers = []

  authors.forEach(author => {
    let blogger = { author, likes: 0 }
    blogs.forEach(blog => {
      if (blog.likes &&
        ((blog.author && blog.author === author) || (!blog.author && author === ''))) {
        blogger.likes = blogger.likes + blog.likes
      }
    })
    bloggers.push(blogger)
  })
  logger.info('debug: mostLikes bloggers:', bloggers)
  const reducer = (mostLiked, blogger) => {
    // last handled blogger
    return mostLiked.likes > blogger.likes ? mostLiked : blogger
  }

  if (blogs && blogs.length === 1)
    return { author: blogs[0].author ? blogs[0].author : '', likes: blogs[0].likes ? blogs[0].likes : 0 }
  return blogs && blogs.length !== 0 ?
    bloggers.reduce(reducer, blogs[0]) : null
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}

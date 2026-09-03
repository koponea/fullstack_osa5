// all the route eventhandlers
const Blog = require('../models/blog')
const User = require('../models/user')
const blogsRouter = require('express').Router()
//const jwt = require('jsonwebtoken')
//const logger = require('../utils/logger')
//const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')
//const { omit } = require('lodash')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  //.populate('user', { username: 1, name: 1 }) // id auto?
    .populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs)
})
/* malli:
blogsRouter.get('/', (request, response) => {
  Blog.find({})
    .populate('user', { username: 1, name: 1, id: 1 })
    .then(blogs => {
      response.json(blogs)
    })
})*/

// no GET/:id in the example
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
    .populate('user', { username: 1, name: 1 }) // id auto?
  if (blog) response.json(blog)
  else response.status(404).json({ error: 'missing entry' })
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  /* these are elsewhere than my 4-ex backend, the token&userExtractor !
  if (!request.user) {
    return response.status(401).json({ error: 'token invalid' })
  }*/
  const user = await User.findById(request.user)
  /*
  if (!user) {
    return response.status(400).json({ error: 'userid missing or not valid' })
  }
  */

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(204).end()
  }

  if (request.user !== blog.user.toString()) {
    return response.status(403).json({ error: 'user not authorized' })
  }

  user.blogs = user.blogs.filter(b => b.id.toString() !== blog.id.toString())
  //set to user not in example??

  //await Blog.findByIdAndDelete(request.params.id)
  await blog.deleteOne()
  response.status(204).end()
})

//blogsRouter.put('/:id', userExtractor, async (request, response) => {
blogsRouter.put('/:id', async (request, response) => {
  //const { title, author, url, likes, userId } = request.body
  const { title, author, url, likes } = request.body

  /* no tokenized put yet
  if (!request.user) {
    return response.status(401).json({ error: 'token invalid' })
  }
  */
  /* no user check now
  const user = await User.findById(request.user)
  if (!user) {
    return response.status(400).json({ error: 'userid missing or not valid' })
  }
  */

  const blog = await Blog.findById(request.params.id)
  //blog || response.status(404).json({ error: 'missing entry, cannot update' })
  if (!blog) { return response.status(404).end()}

  /*  not checked here, userExtractor
  if (request.user !== blog.user.toString()) {
    return response.status(403).json({ error: 'not the creator of the entry' })
  }
  logger.info('equest.params.id:', request.params.id)
  */

  /*
  //!!!! the below does not work! by default PUT replaces the whole
  // so the front should put all data ---!!
  if (title) blog.title = title
  if (author) blog.author = author
  if (url) blog.url = url
  if (likes) blog.likes = likes
  //if (userId) logger.debug('currently the owner stays:', userId)*/
  // these are a must now?, update is all data at once for PUT?
  //!!!! the bleow from ex does not work - if url not in put: Fail!!
  blog.title = title
  blog.author = author
  blog.url = url
  blog.likes = likes
  // blog.user cannot be changed

  const updated = await blog.save()
  //response.status(200).json(updated)
  response.json(updated) // default 200
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  //const blog = new Blog(omit(body, ['userId']))
  const blog = new Blog(body)

  blog.likes = blog.likes | 0 // likes is a must now?
  blog.user = request.user

  // this is from example here, I had elsewhere
  if (!blog.title || !blog.url) {
    return response.status(400).send({ error: 'title or url missing' })
  }

  /* these are elsewhere than my 4-ex backend, the token&userExtractor !
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }*/
  const user = await User.findById(request.user)
  /*if (!user) {
    return response.status(400).json({ error: 'userid missing or not valid' })
  }
  blog.user = user._id */

  const savedBlog = await blog.save()

  user.blogs ?
    user.blogs = user.blogs.concat(savedBlog._id) :
    user.blogs = [savedBlog._id]

  //user.blogs = user.blogs.concat(savedBlog._id) // blogs is a must now?

  await user.save()

  response.status(201).json(savedBlog)
})

module.exports = blogsRouter
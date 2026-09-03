const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const { SALT_ROUNDS } = require('../utils/config')
const { omit, isNil }  = require('lodash')
const logger = require('../utils/logger')

const anonymous = ''

/** test configs */
const listWithNoBlogList = null
const listWithNoBlogs = []
const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }
]
const listWithManyBlogsSimple = [
  { _id: '5a403aa71b54a676234d17f8', title: 'Mindblowing 3', author: 'Zooty', url: 'http://www.helsinki.fi/Harmful3.html', likes: 3, __v: 0 },
  { _id: '5a404aa71b54a676234d17f8', title: 'Mindblowing 4', author: 'Zooty', url: 'http://www.helsinki.fi/Harmful4.html', likes: 4, __v: 0 },
  { _id: '5a400aa71b54a676234d17f8', title: 'Mindblowing 0', author: 'Zooty', url: 'http://www.helsinki.fi/Harmful7.html', likes: 0, __v: 0 },
  { _id: '5a406aa71b54a676234d17f8', title: 'Mindblowing 6', author: 'Zooty', url: 'http://www.helsinki.fi/Harmful6.html', likes: 6, __v: 0 },
  { _id: '5a405aa71b54a676234d17f8', title: 'Mindblowing 5', author: 'Zooty', url: 'http://www.helsinki.fi/Harmful5.html', likes: 5, __v: 0 },
  { _id: '5a417aa71b54a676234d17f8', title: 'Mindblowing 17', author: 'Zooty', url: 'http://www.helsinki.fi/Harmful7.html', likes: 17, __v: 0 }
]
const listWithAlsoNoLikes = [
  { _id: '5a405aa71b54a676234d17f8', title: 'Mindblowing 5', author: 'Zooty', url: 'http://www.helsinki.fi/Harmful5.html', likes: 5, __v: 0 },
  { _id: '5a409aa71b54a676234d17f8', title: 'Mindblowing no', author: 'Zooty', url: 'http://www.helsinki.fi/HarmfulNO.html', __v: 0 },
  { _id: '5a406aa61b54a676234d17f8', title: 'Mindblowing 6', author: 'Zooty', url: 'http://www.helsinki.fi/Harmful6.html', likes: 6, __v: 0 } //
]

const nonExistentId = async (userId) => {
  // highly non-probable that this id is ever reused
  // another thing does the user connection take into use
  // - probably not since the blog will b deleted directly
  const blog = new Blog({
    title: 'willremovethissoon',
    author: 'Zooty',
    url: 'http://www.helsinki.fi',
    likes: 0,
    userId
  })
  const one = await blog.save()
  await Blog.deleteOne({ title: blog.title })
  return one._id.toString()
}

const omitInternals = entity => omit(entity, ['_id', '__v'] )

const buildUserObject = async ({ password, username, name }) => {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = new User({ username, passwordHash })
  if (name) user.name = name
  return user
}

const buildComparableUser = user => {
  const newU = {
    id: user.id ? user.id : user._id.tostring(),
    username: user.username,
  }
  if (user.name) newU.name = user.name
  if (user.blogs) newU.blogs = user.blogs
  return newU
}

// Injecting the blogs for existing users,
// new blogs and blogs added tot the users
const injectToBlogsDbUpdateUsers = async (blogsToInsert = [], users) => {
  // or await Blog.insertMany(whatnotBlogs) e.g.
  const blogObjects = blogsToInsert.map((blog, index) => new Blog({
    ...omitInternals(blog),
    user: users[index] ? users[index].id : users[0].id // some distr
  }))
  const promiseArrayBlogs = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArrayBlogs)
  const userObjectsAll = await User.find({})

  const userIdListUsed = blogObjects.map(n => n.user.toString())

  const userObjectsToSave = userObjectsAll
    .filter(userObj => userIdListUsed.includes(userObj.id))

  for (const user of userObjectsToSave) {
    let updates = blogObjects.filter(blogObj => blogObj.user.toString() === user.id)

    updates = updates.map(update => update._id.toString())
    user.blogs ? user.blogs = user.blogs.concat(updates) : user.blogs = [updates]
  }

  const promiseArrayUsers = userObjectsToSave.map(user => user.save())
  await Promise.all(promiseArrayUsers)
}

const testInitBlogsDb = async ( blogsToInsert = [], users ) => {
  await Blog.deleteMany({})
  if (!isNil(blogsToInsert)) await injectToBlogsDbUpdateUsers(blogsToInsert, users)
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

// Math will do since the DB is wiped out at test setups
const generateTestGuid = () =>
  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

const testInitUsersDb = async ({ password = 'sekret', username = 'root', name = null } = {}) => {
  await User.deleteMany({})
  const rootUser = await buildUserObject({ password, username })
  if (name) rootUser.name = name

  const savedRootUser =  await rootUser.save()
  return savedRootUser
}

const wipeUserAndBlogsDbs = async () => {
  const userClean = await User.deleteMany({})
  const blogsClean = await Blog.deleteMany({})
  logger.debug('deleted users, blogs', userClean, blogsClean)
}

module.exports = {
  anonymous,
  listWithNoBlogList,
  listWithNoBlogs,
  listWithOneBlog,
  listWithManyBlogsSimple,
  listWithAlsoNoLikes,
  buildUserObject,
  buildComparableUser,
  nonExistentId,
  omitInternals,
  injectToBlogsDbUpdateUsers,
  testInitBlogsDb,
  testInitUsersDb,
  usersInDb,
  blogsInDb,
  generateTestGuid,
  wipeUserAndBlogsDbs,
}
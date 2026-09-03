const {
  test,
  after,
  beforeEach,
  describe,
  before
} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app.js')
const helper = require('./test_helper.js')
const logger = require('../utils/logger.js')
const { omit, pick } = require('lodash')

const api = supertest(app) // kääräisy,
// tämä myös käynnistää itse app:in to an ephemeral port

const login = async ({ username, password }) => {
  const response = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)
    .expect('Content-Type', /application\/json/)
  return response.body
}

describe('Blogs main api tests', () => {
  /* users for all cases */
  let users = []
  const ruohoset = {
    matti: { username: 'matti', password: 's1.Matti' },
    teppo: { username: 'teppo', name: 'Teppo Ruohonen', password: 's2.Teppo' },
  }

  before(async () => {
    await helper.wipeUserAndBlogsDbs()
  })

  // yllättävästi valittu tyhjentää db ennen joka testiä, mutta - UT.
  beforeEach(async () => {
    users = []
    await helper.wipeUserAndBlogsDbs()
    const responsem = await api.post('/api/users').send(ruohoset.matti).expect(201)
    users.push({ ...responsem.body, password: ruohoset.matti.password })
    const responset = await api.post('/api/users').send(ruohoset.teppo).expect(201)
    users.push({ ...responset.body, password: ruohoset.teppo.password })
    logger.info('Test users created', users)
  })

  describe('Retrieving data', () => {

    test('blogs are returned as json', async () => {
      const testUsers = [users[0]]
      await helper.injectToBlogsDbUpdateUsers(helper.listWithOneBlog, testUsers)

      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
      await helper.injectToBlogsDbUpdateUsers(helper.listWithManyBlogsSimple, users)
      const blogs = await helper.blogsInDb()
      /*logger.debug('saved blogs [user, blog] ',
        blogs.map(b => [b.user.toString(), b.id]))*/
      const savedBlogsIds = blogs.map(b => b.id)

      await api.get('/api/users')

      const response = await api.get('/api/blogs')
      assert.strictEqual(response.body.length, helper.listWithManyBlogsSimple.length)

      const receivedBlogsIds = response.body.map(b => b.id)
      assert.deepEqual(receivedBlogsIds, savedBlogsIds)
    })
  })
  describe('Creating blogs', () => {

    test('blog is identified with the id attribute', async () => {
      const testUsers = [users[0]]
      await helper.injectToBlogsDbUpdateUsers(helper.listWithOneBlog, testUsers)

      const response = await api.get('/api/blogs/')
      assert.strictEqual(response.body.length, 1)

      logger.info('test identify by "id"', Object.keys(response.body[0]))
      assert(Object.keys(response.body[0]).includes('id'))

      const responseSingle = await api.get(`/api/blogs/${response.body[0].id}`)
      assert.deepStrictEqual(response.body[0], responseSingle.body)
      logger.info(response.body[0], responseSingle.body)
    })

    test('a valid blog can be added', async () => {
      const testUser = users[1] // teppo ?
      const testUserCredentials = {
        password: testUser.password, username: testUser.username
      }
      const { token } = await login(testUserCredentials)

      const otherUsers = [users[0]]
      await helper.injectToBlogsDbUpdateUsers(helper.listWithManyBlogsSimple, otherUsers)
      const blogsInjected = await helper.blogsInDb()

      const blogNew = {
        title: helper.generateTestGuid(),
        author: 'mesohappy',
        url: 'http://www.u.nocando.com',
        likes: 5,
        //userId: testUser.id
      }

      //const response = await api
      await api
        .post('/api/blogs')
        .auth(token, { type: 'bearer' })
        .send(blogNew)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      //logger.debug('after new post response:', response)


      const blogs = await helper.blogsInDb()
      assert.strictEqual(blogs.length, blogsInjected.length + 1)
      logger.info('after new post', blogs.map(b => b.title))

      const blog = blogs.find(blog => blog.title === blogNew.title)
      assert.deepStrictEqual(
        omit(blog, ['id', 'user']),
        blogNew //omit(blogNew, ['userId'])
      )

      const updatedUsers = await api.get('/api/users')
      const updatedUser = updatedUsers.body.find(user => user.id === testUser.id)

      const found = updatedUser.blogs.find(b => b.id === blog.id)
      assert(found)
    })

    test('a blog with no likes gets zero likes', async () => {
      const testUser = users[1]  // teppo
      const testUserCredentials = {
        password: testUser.password, username: testUser.username
      }
      const { token } = await login(testUserCredentials)

      await helper.injectToBlogsDbUpdateUsers(helper.listWithManyBlogsSimple, users)
      const blogsInjected = await helper.blogsInDb()

      const blogNew = {
        title: helper.generateTestGuid(),
        author: 'Mesohappy Again',
        url: 'http://www.u.nolikes.com',
        //userId: testUser.id // teppo
      }

      await api
        .post('/api/blogs')
        .auth(token, { type: 'bearer' })
        .send(blogNew)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsFresh = await helper.blogsInDb()
      assert.strictEqual(blogsFresh.length, blogsInjected.length + 1)

      const blogFresh = blogsFresh.find(blog => blog.title === blogNew.title)
      assert.deepStrictEqual(
        omit(blogFresh, ['id', 'user']),
        { ...blogNew, likes: 0 }
      )
    })
  })

  describe('Creating blogs unsuccessfully', () => {

    test('a blog with no title or url gets 400', async () => {
      const testUser = users[1] // teppo
      const testUserCredentials = {
        password: testUser.password, username: testUser.username
      }
      const { token } = await login(testUserCredentials)

      await helper.injectToBlogsDbUpdateUsers(helper.listWithManyBlogsSimple, users)
      const blogsInjected = await helper.blogsInDb()

      const blogNew = {
        title: helper.generateTestGuid(),
        author: 'Mesohappy Again',
        likes: 0,
        url: 'http://www.u.nolikes.com',
        userId: testUser.id
      }

      await api
        .post('/api/blogs')
        .auth(token, { type: 'bearer' })
        .send(omit(blogNew, ['url']))
        .expect(400)

      await api
        .post('/api/blogs')
        .auth(token, { type: 'bearer' })
        .send(omit(blogNew, ['author']))
        .expect(400)

      await api
        .post('/api/blogs')
        .auth(token, { type: 'bearer' })
        .send(omit(blogNew, ['author', 'url']))
        .expect(400)

      const blogsFresh = await helper.blogsInDb()
      assert.strictEqual(blogsFresh.length, blogsInjected.length)

      const newBlogs = blogsFresh.filter(blog => blog.title === blogNew.title)
      assert(newBlogs.length === 0)
    })

    test('a blog with no auth token gets 401 Unauthorized', async () => {
      const testUser = users[1] // teppo
      await helper.injectToBlogsDbUpdateUsers(helper.listWithManyBlogsSimple, users)
      const blogsInjected = await helper.blogsInDb()

      const blogNew = {
        title: helper.generateTestGuid(),
        author: 'Mesohappppy',
        likes: 10,
        url: 'http://www.u.nolikes.com',
        userId: testUser.id
      }

      await api
        .post('/api/blogs')
        .send(omit(blogNew, ['url']))
        .expect(401)

      const blogsFresh = await helper.blogsInDb()
      assert.strictEqual(blogsFresh.length, blogsInjected.length)

      const newBlogs = blogsFresh.filter(blog => blog.title === blogNew.title)
      assert(newBlogs.length === 0)
    })
  })

  describe('Deleting entries and verifying user data', () => {
    test('a specific blog entry can be deleted', async () => {
      const otherUsers = [users[0]]
      const testUser = users[1] // teppo
      const testCredentials = {
        password: testUser.password, username: testUser.username
      }
      const { token } = await login(testCredentials)

      const blogNew = {
        title: helper.generateTestGuid(),
        author: 'mesohappy',
        url: 'http://www.u.nocando.com',
        userId: testUser.id
      }

      await helper.injectToBlogsDbUpdateUsers([blogNew], [testUser])
      await helper.injectToBlogsDbUpdateUsers(
        helper.listWithManyBlogsSimple, otherUsers
      )
      const entriesInDbStart = await helper.blogsInDb()
      const blog = entriesInDbStart.find(
        blog => blog.title === blogNew.title
      )
      logger.info('injected blog', blog)

      const usersInStart = await api.get('/api/users')
      const userInStart = usersInStart.body.find(
        user => user.id === testUser.id
      )

      let blogInUsersBlogs = userInStart.blogs.find(
        b => b.id === blog.id
      )
      assert(blogInUsersBlogs)

      await api.delete(`/api/blogs/${blog.id}`)
        .auth(token, { type: 'bearer' })

      const entriesInDbAfterDelete = await helper.blogsInDb()
      const titlesInDbAfterDelete =
        entriesInDbAfterDelete.map(e => e.title)

      assert.strictEqual(entriesInDbAfterDelete.length,
        helper.listWithManyBlogsSimple.length)
      assert(!titlesInDbAfterDelete.includes(blogNew.title))

      const updatedUsers = await api.get('/api/users')
      const updatedUser = updatedUsers.body.find(
        user => user.id === testUser.id
      )
      const found = updatedUser.blogs.find(b => b.id === blog.id)
      assert(!found)
    })

    test('the last blog entry can be deleted', async () => {
      const testUser = users[1] // teppo
      const testCredentials = {
        password: testUser.password, username: testUser.username
      }
      const { token } = await login(testCredentials)

      const blogNew = {
        title: helper.generateTestGuid(),
        author: 'mesohappy',
        url: 'http://www.u.nocando.com',
        userId: testUser.id
      }

      await helper.injectToBlogsDbUpdateUsers([blogNew], [testUser])

      const entries = await helper.blogsInDb()
      assert(entries.length === 1)
      assert(entries[0].title === blogNew.title)
      logger.info('last entry for deletion:',
        entries[0].id ? entries[0].id : 'missing!!')

      await api.delete(`/api/blogs/${entries[0].id}`)
        .auth(token, { type: 'bearer' })
        .expect(204)

      const entriesInDbAfterDelete = await helper.blogsInDb()
      assert(entriesInDbAfterDelete.length === 0)

      const updatedUsers = await api.get('/api/users')
      const updatedUser = updatedUsers.body.find(
        user => user.id === testUser.id
      )
      const found = updatedUser.blogs.find(b => b.id === entries[0].id)
      assert(!found)
    })

    test('a blog entry cannot be deleted by a non-creator', async () => {
      const creator = users[1] // teppo
      const nonCreator = users[0]
      const nonCreatorCredentials = {
        password: nonCreator.password, username: nonCreator.username
      }
      const { token } = await login(nonCreatorCredentials)

      const blogNew = {
        title: helper.generateTestGuid(),
        author: 'mesohappy cannotdelete',
        url: 'http://www.u.nocando.com',
        userId: creator.id
      }

      await helper.injectToBlogsDbUpdateUsers([blogNew], [creator])
      await helper.injectToBlogsDbUpdateUsers(
        helper.listWithManyBlogsSimple, [nonCreator]
      )
      const entries = await helper.blogsInDb()
      const blog = entries.find(blog => blog.title === blogNew.title) //ok

      await api.delete(`/api/blogs/${blog.id}`)
        .auth(token, { type: 'bearer' })
        .expect(403)

      const entriesInDbAfterDelete = await helper.blogsInDb()
      const titlesInDbAfterDelete = entriesInDbAfterDelete.map(e => e.title)

      assert.strictEqual(entriesInDbAfterDelete.length,
        helper.listWithManyBlogsSimple.length + 1)
      assert(titlesInDbAfterDelete.includes(blogNew.title))

      const updatedUsers = await api.get('/api/users')
      const updatedUser = updatedUsers.body.find(
        user => user.id === creator.id
      )
      const found = updatedUser.blogs.find(b => b.id === blog.id)
      assert(found)
    })
  })

  describe('Edit entries', () => {
    test('a specific blog entry can be edited', async () => {
      await helper.injectToBlogsDbUpdateUsers(
        helper.listWithManyBlogsSimple, users
      )

      const testUser = users[0]
      const testUserCredentials = {
        password: testUser.password, username: testUser.username
      }
      const { token } = await login(testUserCredentials)

      const entries = await helper.blogsInDb()
      const blog = entries.find(blog =>
        blog.likes && blog.likes > 0 &&
        blog.user.toString() === testUser.id
      )

      const modBlog = {
        ...omit(blog, ['user']),
        userId: testUser.id,                        // old
        likes: blog.likes ? blog.likes + 10 : 110
      }

      //const response = await api
      await api
        .put(`/api/blogs/${blog.id}`)
        .auth(token, { type: 'bearer' })
        .send(modBlog)
        .expect(200)

      //logger.debug('blogsApi resp', response)


      const entriesInDbAfterPut = await helper.blogsInDb()
      assert.strictEqual(entriesInDbAfterPut.length, entries.length)

      const entryAfterPut = await api.get(`/api/blogs/${blog.id}`)
      assert.deepStrictEqual(
        pick(entryAfterPut.body, ['likes', 'title', 'id', 'author']),
        pick(modBlog, ['likes', 'title', 'id', 'author'])
      )
    })

    test('a non-existent blog entry cannot be edited', async () => {
      const testUser = users[0]
      const testUserCredentials = {
        password: testUser.password, username: testUser.username
      }
      const { token } = await login(testUserCredentials)

      await helper.injectToBlogsDbUpdateUsers(
        helper.listWithManyBlogsSimple, users
      )
      const entries = await helper.blogsInDb()
      const blogId = await helper.nonExistentId()

      await api
        .put(`/api/blogs/${blogId}`)
        .auth(token, { type: 'bearer' })
        .send({ ...entries[0], likes: 111 })
        .expect(404)

      const entriesInDbAfterPut = await helper.blogsInDb()
      assert.strictEqual(entriesInDbAfterPut.length, entries.length)
    })
  })

  after(async () => {
    await mongoose.connection.close()
    logger.debug('blogsApi---'.repeat(10))
  })
})

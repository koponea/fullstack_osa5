const assert = require('node:assert')
const {
  after,
  describe,
  test,
  beforeEach,
} = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app.js')
const helper = require('./test_helper.js')
const logger = require('../utils/logger.js')
const {
  USERNAME_MIN,
  USERNAME_MAX,
  PASSWORD_MIN,
  PASSWORD_MAX,
} = require('../utils/config.js')
const { omit }  = require('lodash')

const api = supertest(app) // kääräisy
// tämä myös käynnistää itse app:in to an ephemeral port

const genRndId = () => Math.floor(Math.random() * 1000000000).toString()

let users=[]

describe('User api tests', () => {

  const genericApiUserData = {
    username: `suiteuser-${genRndId()}`,
    name: 'Tiina Testaaja',
    password: 'passu123.$',
  }

  beforeEach(async () => {
    users=[]

    helper.wipeUserAndBlogsDbs()
    // cleanup + create root user
    const root = await helper.testInitUsersDb({ username: `root-${genRndId()}` })
    users.push({ ...omit(root,['_id']), id: root._id.toString() })

    const genericApiUser = await helper.buildUserObject(genericApiUserData)
    const savedUser = await genericApiUser.save()
    users.push({ ...omit(savedUser,['_id']), id: savedUser._id.toString() })
  })
  describe('Retrive user', () => {

    test('users are returned as json', async () => {
      await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all users are returned', async () => {
      const response = await api.get('/api/users')
      logger.info('test all returned, get resp:', response.body)
      logger.info('test all returned, saved:', users)

      assert.strictEqual(response.body.length, users.length)

      const testUsers = []
      users.forEach(user => testUsers.push(helper.buildComparableUser(user)))

      assert.deepEqual(testUsers, response.body)
    })

    test('a specific user is within the returned users', async () => {
      const user = users[1] // 0 is root
      const response = await api.get('/api/users')
      const usernames = response.body.map(e => e.username)

      assert(usernames.includes(user.username))
    })

    test('a specific user can be returned', async () => {
      const user = users[1] // 0 is root
      const response = await api.get(`/api/users/${user.id}`)
      logger.info('specific user can, get resp:', response.body)

      assert.deepEqual(response.body, helper.buildComparableUser(user))
    })
  })

  describe('Create user', () => {

    test('creation succeeds with a fresh username', async () => {
      // db not empty but 1st with api
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: `a-kopondeeros-${genRndId()}`,
        name: 'koponen',
        password: 'passu-whatevs.Kopo1',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creation fails statuscode and message if username in use', async () => {
      const usersAtStart = await helper.usersInDb()

      const result = await api
        .post('/api/users')
        .send(genericApiUserData)
        .expect(400)
        .expect('Content-Type', /application\/json/)
      logger.info(result.statusCode, result.body.error)

      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails with username length errors', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'ro'.repeat(USERNAME_MIN),
        name: 'RoU'.repeat(USERNAME_MIN),
        password: 'sec'.repeat(PASSWORD_MIN)
      }
      const longUserName = 'u'.repeat(USERNAME_MAX + 1)
      const shortUserName = 'u'.repeat(USERNAME_MIN - 1)

      let result = await api
        .post('/api/users')
        .send({ ...newUser, username: longUserName })
        .expect(400)
        .expect('Content-Type', /application\/json/)
      assert(result.body.error.includes(`maximum ${USERNAME_MAX}`))

      result = await api
        .post('/api/users')
        .send({ ...newUser, username: shortUserName })
        .expect(400)
        .expect('Content-Type', /application\/json/)
      assert(result.body.error.includes(
        `${shortUserName} length must be at least ${USERNAME_MIN}`)
      )

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails with password length errors', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'ro'.repeat(USERNAME_MIN),
        name: 'RoP'.repeat(USERNAME_MIN),
        password: 'sec'.repeat(PASSWORD_MIN)
      }
      const longPassword = 'p'.repeat(PASSWORD_MAX + 1)
      const shortPassword = 'p'.repeat(PASSWORD_MIN - 1)

      let result = await api
        .post('/api/users')
        .send({ ...newUser, password: longPassword })
        .expect(400)
        .expect('Content-Type', /application\/json/)
      assert(result.body.error.includes(`maximum ${PASSWORD_MAX}`))

      result = await api
        .post('/api/users')
        .send({ ...newUser, password: shortPassword })
        .expect(400)
        .expect('Content-Type', /application\/json/)
      assert(result.body.error.includes(
        `length must be at least ${PASSWORD_MIN}`)
      )
      assert(result.body.error.includes('password')
      )

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
  })

  after(async () => {
    await mongoose.connection.close()
    logger.debug('usersApi---'.repeat(10))
  })
})

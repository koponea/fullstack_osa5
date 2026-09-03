// all the route eventhandlers
const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const logger = require('../utils/logger')
const User = require('../models/user')
const { // not in example
  SALT_ROUNDS,
  PASSWORD_MIN,
  PASSWORD_MAX,
} = require('../utils/config')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
    .populate('blogs', {
      title: 1,
      author: 1,
      url: 1,
      id: 1
    }) // likes:1 }) //why no likes in example?

  response.json(users)
})

// no GET/:id in example
usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id)
    .populate('blogs', { title: 1, author: 1, url: 1, id:1 })
    //.populate('blogs', { title: 1, author: 1, url: 1, likes:1 })
  if (user) response.json(user)
  else response.status(404).end()  // end - no data coming
})

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body
  logger.info('request.body', request.body)

  // not in example
  if (!username) {
    return response.status(400).json({ error: 'username missing' })
  }
  /* in ex, here this is done in model
  if (!password || password.length < 3) {
    return response.status(400).json({
      error: 'Password is required and its minimum length is 3 characters'
    })
  }*/

  // is this torta po torta, is in models already
  if (password && password.length < PASSWORD_MIN)
    return response.status(400).json(
      { error: `password length must be at least ${PASSWORD_MIN}` }
    )

  // not in example, as the max is not used in example. Tests.
  if (password && password.length > PASSWORD_MAX)
    return response.status(400).json(
      { error: `password length must be maximum ${PASSWORD_MAX}` }
    )

  // possible to have no password if env var accepts
  const pwd = password ? password : ''
  const passwordHash = await bcrypt.hash(pwd, SALT_ROUNDS)
  logger.info('passwordHash', passwordHash)

  const user = new User({ username, passwordHash })
  //possible to have no username, not in example
  if (name) user.name = name
  logger.info(user)

  const saved = await user.save()
  logger.info('added user', saved)
  response.status(201).json(saved) // toJSON:ed
})

// no DELETE/:id in example
usersRouter.delete('/:id', async (request, response) => {
  await User.deleteOne({ _id: request.params.id })
  response.status(204).end()
})

module.exports = usersRouter
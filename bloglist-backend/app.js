// cannot for this express require('express-async-errors')
const express = require('express')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')
const loginRouter = require('./controllers/login')
const usersRouter = require('./controllers/users')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

const app = express()

const mongoUrl = config.MONGODB_URI_BLOGS
mongoose.connect(mongoUrl, { family: 4 })
  .then(() => {
    logger.info('connected to mongodb')
  })
  .catch((error) => {
    logger.error('failed to connect to mogodb', error.message)
  })

app.use(express.json())  // before the requestLogger to get reqbody
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)
app.use('/api/login', loginRouter) // binding to the routebase
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

// middleware for a non-defined route
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
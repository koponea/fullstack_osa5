require('dotenv').config()
const { toInteger } = require('lodash')

const PORT = process.env.PORT || 3003

const MONGODB_URI_BLOGS = process.env.NODE_ENV &&
  process.env.NODE_ENV === 'test' ?
  process.env.TEST_MONGODB_URI_BLOGS :
  process.env.MONGODB_URI_BLOGS

/* in part 4 be example only blogs app be:
const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI */

const LOGGER_TEST_DEBUG = process.env.NODE_ENV &&
  process.env.NODE_ENV === 'test' ? true : false

const USERNAME_MIN = process.env.USERNAME_MIN || 3
const PASSWORD_MIN = process.env.PASSWORD_MIN || 3
const USERNAME_MAX = process.env.USERNAME_MAX || 64
const PASSWORD_MAX = process.env.PASSWORD_MAX || 128
const SALT_ROUNDS = toInteger(process.env.SALT_ROUNDS) || 10

module.exports = {
  PORT,
  MONGODB_URI_BLOGS,
  LOGGER_TEST_DEBUG,
  USERNAME_MIN,
  USERNAME_MAX,
  PASSWORD_MIN,
  PASSWORD_MAX,
  SALT_ROUNDS
}

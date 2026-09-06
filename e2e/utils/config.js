require('dotenv').config()
const { toInteger } = require('lodash')

const PORT = process.env.PORT || 3003

const MONGODB_URI_BLOGS = process.env.NODE_ENV &&
  process.env.NODE_ENV === 'test' ?
  process.env.TEST_MONGODB_URI_BLOGS :
  process.env.MONGODB_URI_BLOGS

const USERNAME_MIN = process.env.USERNAME_MIN || 3
const PASSWORD_MIN = process.env.PASSWORD_MIN || 3
const USERNAME_MAX = process.env.USERNAME_MAX || 64
const PASSWORD_MAX = process.env.PASSWORD_MAX || 128
const SALT_ROUNDS = toInteger(process.env.SALT_ROUNDS) || 10

const USERNAME_DEFAULT = process.env.USERNAME_DEFAULT || 'superuser'
const PASSWORD_DEFAULT = process.env.PASSWORD_DEFAULT || 'salaisuus'
const USER_NAME_DEFAULT = process.env.USER_NAME_DEFAULT || 'super'
const FE_URL = process.env.FE_URL || 'http://localhost:3003'

module.exports = {
  FE_URL,
  PORT,
  MONGODB_URI_BLOGS,
  USERNAME_MIN,
  USERNAME_MAX,
  PASSWORD_MIN,
  PASSWORD_MAX,
  SALT_ROUNDS,
  USER_NAME_DEFAULT,
  USERNAME_DEFAULT,
  PASSWORD_DEFAULT
}

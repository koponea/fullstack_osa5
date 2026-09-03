const config = require('./config')
const logDebug = config.LOGGER_TEST_DEBUG

const info = (...params) =>
  process.env.NODE_ENV !== 'test' && console.log(...params)

const error = (...params) =>
  process.env.NODE_ENV !== 'test' && console.error(...params)

const debug = (...params) => logDebug && console.debug(...params)
const debugDenseString = (...params) =>
  logDebug && console.debug(
    'debug:', params[0].toString().replace(/[\n\r\t]/gm, '')
  )

module.exports = { info, error, debug, debugDenseString }
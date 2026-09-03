// to be set under env var
const info = (...params) =>  console.log(...params)
const error = (...params) =>  console.error(...params)
const debug = (...params) => console.debug(...params)

export default { info, error, debug }
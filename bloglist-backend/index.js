
const app = require('./app') // varsinainen Express-sovellus
const { PORT } = require('./utils/config')
const { info } = require('./utils/logger')

info('Blogilista app coming around...')

app.listen(PORT, () => {
  info(`Server running on port ${PORT}`)
})

const mongoose = require('mongoose')
const config = require('../config/config')
const { host, port, name } = config
const connectionUrl = `mongodb://${host}:${port}/${name}`

// useNewUrlParser === to avoid warning
mongoose.connect(connectionUrl, { useNewUrlParser: true })
const connection = mongoose.connection

connection.on('open', () => {
  console.log('Database connected...')
})

module.exports = mongoose

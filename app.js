const express = require('express')
const config = require('./config/config')
require('./db/connect')
const app = express()
app.use(express.json())
require('./routes/v1/index.routes')(app)

app.listen(config.appPort, () => {
  console.log('Server started!')
})

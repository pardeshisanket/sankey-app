const mongoose = require('mongoose')
const config = require('../config/config')
const { MONGODBURI } = config
const connectionUrl = MONGODBURI
const sankeyUser = require('./models/sankeyUser')
const counterSchema = require('./models/counters')

mongoose.connect(connectionUrl, { useNewUrlParser: true })
const connection = mongoose.connection

connection.on('open', async () => {
  console.log('Database connected...')

  const changeStream = sankeyUser.watch()
  changeStream.on('change', async (data) => {
    const updateNormalCount = async () => {
      // console.log('Data ', data)
      if (data.operationType === 'insert' && data.fullDocument.userType === 'Normal') {
        // console.log('User inserted: ', data.fullDocument)
        return await counterSchema.findOneAndUpdate({ userType: 'Normal' }, { $inc: { count: 1 } }, { upsert: true, new: true })
      }

      if (data.operationType === 'insert' && data.fullDocument.userType === 'Prime') {
        // console.log('User inserted: ', data.fullDocument)
        return await counterSchema.findOneAndUpdate({ userType: 'Prime' }, { $inc: { count: 1 } }, { upsert: true, new: true })
      }

      if (data.operationType === 'replace') {
        console.log('User replaced: ', data.fullDocument)
        // return await counterSchema.findOneAndUpdate({ userType: 'Normal' }, { $inc: { count: 0 } }, { upsert: true, new: true })
      }
    }

    const update = await updateNormalCount()
    console.log(update)
  })
})

module.exports = mongoose

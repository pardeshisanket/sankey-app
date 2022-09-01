const { default: mongoose } = require('mongoose')

const counterSchema = new mongoose.Schema({
  userType: {
    type: String
  },
  count: {
    type: Number,
    default: 0
  }
})

module.exports = mongoose.model('counters', counterSchema)

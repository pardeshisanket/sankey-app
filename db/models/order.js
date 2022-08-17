const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  orderName: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Pending',
    required: true
  }
})

// will autogenerate createdAt and updatedAt
orderSchema.set('timestamps', true)

module.exports = mongoose.model('Order', orderSchema)

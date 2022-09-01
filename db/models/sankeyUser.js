const mongoose = require('mongoose')

const sankeyUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  phoneNo: {
    type: Number,
    required: true
  },
  userType: {
    type: String,
    default: 'Normal'
  },
  hobbies: [
    {
      hobby: {
        type: String
      }
    }
  ],
  isDeleted: {
    type: Boolean,
    default: false
  }
})

const sankeyUser = mongoose.model('sankeyUser', sankeyUserSchema)

module.exports = sankeyUser

// username,firstname, lastname, email, password, address, phoneno, userType

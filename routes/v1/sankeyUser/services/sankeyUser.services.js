const config = require('../../../../config/config')
// const mongoose = require("mongoose")
const jwt = require('jsonwebtoken')
const argon2 = require('argon2')

const sankeyUser = require('../../../../db/models/sankeyUser')
const orderSchema = require('../../../../db/models/order')

// Create UserService
const createUser = async (body) => {
  try {
    const addedUser = await sankeyUser.create(body)
    return addedUser
  } catch (err) {
    throw Error('Error: ' + err)
  }
}

// Get User with id
const getUser = async (id) => {
  try {
    const user = await sankeyUser.findOne({ _id: id, isDeleted: false })
    if (!user) {
      throw new Error('User is Deleted')
    }
    return user
  } catch (err) {
    throw Error('Error: ' + err)
  }
}

// Get AllUsers using aggregation
const getAllUsers = async () => {
  try {
    const users = await sankeyUser.aggregate([
      {
        $match: { isDeleted: false }
      }
    ])
    return users
  } catch (err) {
    throw Error('Error :' + err)
  }
}

// Generate Token when user wants to login
const generateToken = async (email, id) => {
  try {
    const jwtSecretKey = config.JWT_TOKEN
    const user = { email, id }
    console.log(id)
    // console.log(user, ' user')
    const token = jwt.sign(user, jwtSecretKey)
    // console.log(token)
    return token
  } catch (err) {
    throw Error('Error :' + err)
  }
}

// Fetches user with correct credentials
const getloginUser = async (email, password) => {
  try {
    // Finds user with email
    const user = await sankeyUser.findOne({ email })
    const encryptPassword = user.password
    // Compares passwords
    if (await argon2.verify(encryptPassword, password)) {
      // password match
      return user
    } else {
      // password did not match
      throw new Error('Please enter a valid password')
    }
  } catch (err) {
    throw Error('Error :' + err)
  }
}

// Place a Order
const placeOrder = async (userId, orderName, address, city) => {
  try {
    const order = await orderSchema.create({
      userId,
      orderName,
      address,
      city
    })
    if (order) return order
    throw new Error('Order failed!')
  } catch (err) {
    throw Error('Error :' + err)
  }
}

const filterOrders = async (searchKey, status, fromDate, toDate) => {
  try {
    // console.log(searchKey, 'searchKey')
    // console.log(status, 'status')
    // console.log(fromDate, 'fromDate')
    // console.log(toDate, 'toDate')
    if (!status) {
      status = 'Pending'
    }
    if (!fromDate) {
      const date = new Date()
      console.log(date, 'today')
      fromDate = new Date(date.setMonth(date.getMonth() - 1))
      console.log(fromDate, 'toDate')
    }
    if (!toDate) {
      const date = new Date()
      console.log(date, 'today')
      toDate = new Date(date.setMonth(date.getMonth() + 1))
      console.log(toDate, 'toDate')
    }
    let searchKeyCond = false
    if (searchKey) {
      searchKeyCond = true
    }
    const orderFILTER = [
      [
        {
          $match: {
            $and: [
              {
                $or: [
                  searchKeyCond ? { username: { $regex: searchKey, $options: 'i' } } : {},
                  searchKeyCond ? { firstName: { $regex: searchKey, $options: 'i' } } : {},
                  searchKeyCond ? { lastName: { $regex: searchKey, $options: 'i' } } : {},
                  searchKeyCond ? { email: { $regex: searchKey, $options: 'i' } } : {},
                  searchKeyCond ? { orderName: { $regex: searchKey, $options: 'i' } } : {},
                  searchKeyCond ? { city: { $regex: searchKey, $options: 'i' } } : {}
                ]
              },
              {
                status
              },
              {
                updatedAt: {
                  $gte: new Date(fromDate),
                  $lte: (() => {
                    const date = new Date(toDate)
                    date.setDate(date.getDate() + 1)
                    return date
                  })()
                }
              }
            ]
          }
        },
        {
          $project: {
            userId: 1,
            orderName: 1,
            updatedAt: 1,
            address: 1,
            city: 1,
            status: 1
          }
        }
      ]
    ]
    console.log(JSON.stringify(orderFILTER))
    const orders = await orderSchema.aggregate(orderFILTER)
    // console.log(orders, ' orders')
    if (orders) return orders
    throw new Error('Order(s) not found!')
  } catch (err) {
    throw Error('Error :' + err)
  }
}

module.exports = {
  createUser,
  getUser,
  getAllUsers,
  generateToken,
  getloginUser,
  placeOrder,
  filterOrders
}

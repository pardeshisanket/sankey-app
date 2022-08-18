const config = require('../../../../config/config')
// const mongoose = require("mongoose")
const jwt = require('jsonwebtoken')
const argon2 = require('argon2')

const sankeyUser = require('../../../../db/models/sankeyUser')
const orderSchema = require('../../../../db/models/order')

// Create UserService
const createUser = async (body) => {
  try {
    const id = body._id
    const newUser = await sankeyUser.findOneAndUpdate({ _id: id }, body, { upsert: true, new: true })
    return newUser
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

const filterOrders = async (searchKey, sortingKey, sortOrder, page, status, fromDate, toDate) => {
  try {
    let searchKeyCond = false
    if (searchKey) {
      searchKeyCond = true
    }

    if (!status) {
      status = 'Pending'
    }

    if (!fromDate) {
      const date = new Date()
      fromDate = new Date(date.setMonth(date.getMonth() - 1))
    }
    if (!toDate) {
      const date = new Date()
      toDate = new Date(date.setMonth(date.getMonth() + 1))
    }

    if (!sortingKey) {
      sortingKey = 'updatedAt'
    }
    let sortFlag = -1
    if (sortOrder === 'ascending') {
      sortOrder = 'ascending'
      sortFlag = 1
    } else if (!sortOrder) {
      sortOrder = 'descending'
      sortFlag = -1
    }

    const limit = 2
    let skip = 0
    if (!page) {
      page = 0
    }
    skip = page * limit

    const paginationFilter = [
      { $skip: skip },
      { $limit: limit }
    ]

    const addFields = {
      $addFields: {
        userObjectId: { $convert: { input: '$userId', to: 'objectId', onError: '', onNull: '' } }
      }
    }

    const lookup = {
      $lookup: {
        from: 'sankeyusers',
        as: 'userAllOrders',
        let: {
          userid: '$userObjectId'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  '$_id', '$$userid'
                ]
              }
            }
          }, {
            $project: {
              _id: 0,
              firstName: 1,
              lastName: 1,
              username: 1,
              email: 1,
              address: 1,
              city: 1,
              phoneNo: 1,
              userType: 1
            }
          }
        ]
      }
    }

    const match = {
      $match: {
        $and: [
          {
            $or: [
              searchKeyCond ? { 'userAllOrders.username': { $regex: searchKey, $options: 'i' } } : {},
              searchKeyCond ? { 'userAllOrders.firstName': { $regex: searchKey, $options: 'i' } } : {},
              searchKeyCond ? { 'userAllOrders.lastName': { $regex: searchKey, $options: 'i' } } : {},
              searchKeyCond ? { 'userAllOrders.email': { $regex: searchKey, $options: 'i' } } : {},
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
    }

    const sort = {
      $sort: {
      }
    }
    sort.$sort[sortingKey] = sortFlag

    const facet = {
      $facet: {
        rows: paginationFilter,
        count: [
          { $count: 'count' }
        ]
      }
    }

    const count = {
      $addFields: {
        count: {
          $switch: {
            branches: [
              {
                case: { $eq: ['$count', []] },
                then: [{ count: 0 }]
              }
            ],
            default: {
              $ifNull: [{ $arrayElemAt: ['$count.count', 0] }, 0]
            }
          }
        }
      }
    }

    const stages = [addFields, lookup, match, sort, facet, count]
    const orders = await orderSchema.aggregate(stages)
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

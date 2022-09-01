const config = require('../../../../config/config')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const argon2 = require('argon2')

const sankeyUser = require('../../../../db/models/sankeyUser')
const orderSchema = require('../../../../db/models/order')

// Create UserService
const createUser = async (body) => {
  try {
    const id = body._id
    if (!body._id) {
      delete body._id
    }
    const newUser = await sankeyUser.findOneAndUpdate({ _id: id || mongoose.Types.ObjectId() }, body, { upsert: true, new: true })
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
const getAllUsers = async (searchKey = '', sortingKey = 'firstName', sortOrder = 'asc', page, filterCity) => {
  try {
    // fullname username email address city
    sortingKey = !sortingKey ? 'firstName' : sortingKey
    let sortFlag = -1
    sortOrder === 'asc' ? sortFlag = 1 : sortFlag = -1
    console.log('sortFlag', sortFlag)
    // filterCity = filterCity === '' ? undefined : filterCity
    console.log('filterCity ', filterCity)

    const limit = 2
    let skip = 0
    page = !page ? 0 : page
    skip = page * limit

    const paginationFilter = [
      { $skip: skip },
      { $limit: limit }
    ]

    const match = {
      $match: {
        $and: [
          {
            $or: [
              { firstName: { $regex: searchKey, $options: 'i' } },
              { lastName: { $regex: searchKey, $options: 'i' } },
              { username: { $regex: searchKey, $options: 'i' } },
              { email: { $regex: searchKey, $options: 'i' } },
              { address: { $regex: searchKey, $options: 'i' } },
              // { city: { $regex: searchKey, $options: 'i' } },
              { phoneNo: { $regex: searchKey, $options: 'i' } },
              {
                hobbies: {
                  $elemMatch: {
                    hobby: {
                      $all: [
                        searchKey
                      ]
                    }
                  }
                }
              }
            ]
          },
          filterCity?.length
            ? {
                city: filterCity
              }
            : {},
          {
            isDeleted: false
          }
        ]
      }
    }

    const sortingFunction = {
      firstName: {
        firstName: sortFlag
      },
      lastName: {
        lastName: sortFlag
      },
      username: {
        username: sortFlag
      },
      email: {
        email: sortFlag
      },
      address: {
        address: sortFlag
      },
      city: {
        city: sortFlag
      }
    }[sortingKey]

    const sort = {
      $sort: { ...sortingFunction }
    }

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

    const stages = [match, sort, facet, count]

    const users = await sankeyUser.aggregate(stages)
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
    const token = jwt.sign(user, jwtSecretKey)
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

const filterOrders = async (searchKey, sortingKey, sortAsc, page, status, fromDate, toDate) => {
  try {
    status = !status ? 'Pending' : status
    const today = new Date()
    fromDate = fromDate === null ? new Date(today.setMonth(today.getMonth() - 1)) : fromDate
    toDate = toDate === null ? new Date(today.setMonth(today.getMonth() + 1)) : toDate

    sortingKey = !sortingKey ? 'updatedAt' : sortingKey

    let sortFlag = -1
    sortAsc === true ? sortFlag = 1 : sortFlag = -1

    const limit = 5
    let skip = 0
    page = !page ? 0 : page
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
              { 'userAllOrders.username': { $regex: searchKey, $options: 'i' } },
              { 'userAllOrders.firstName': { $regex: searchKey, $options: 'i' } },
              { 'userAllOrders.lastName': { $regex: searchKey, $options: 'i' } },
              { 'userAllOrders.email': { $regex: searchKey, $options: 'i' } },
              { orderName: { $regex: searchKey, $options: 'i' } },
              { city: { $regex: searchKey, $options: 'i' } }
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

    const sortingFunction = {
      updatedAt: {
        updatedAt: sortFlag
      },
      orderName: {
        orderName: sortFlag
      },
      city: {
        city: sortFlag
      },
      status: {
        status: sortFlag
      }
    }[sortingKey]

    const sort = {
      $sort: { ...sortingFunction, id: 1 }
    }

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

const sankeyUserService = require('../services/sankeyUser.services')
const { validationResult } = require('express-validator')
const argon2 = require('argon2')
// const jwt = require('jsonwebtoken')
// const config = require('../../../../config/config')

// Create a sankeyUser
const createUser = async (req, res) => {
  try {
    const hasError = validationResult(req)
    if (!hasError.isEmpty()) {
      return res.send({ error: hasError.array() })
    }
    const body = req.body
    req.body.password = await argon2.hash(req.body.password)
    const user = await sankeyUserService.createUser(body)
    return res.status(201).json({
      success: true,
      data: user,
      message: 'Created SankeyUser Successfully!'
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

// Get a sankeyUser by ID
const getUser = async (req, res) => {
  try {
    const id = req.params.id
    const user = await sankeyUserService.getUser(id)
    return res.status(200).json({
      success: true,
      data: user,
      message: 'SankeyUser retrieved successfully!'
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await sankeyUserService.getAllUsers()
    return res.status(200).json({
      success: true,
      data: users,
      message: 'Retrieved all SankeyUsers successfully!'
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

// User logs in
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await sankeyUserService.getloginUser(email, password)
    if (!user) {
      throw new Error('Please enter valid credentails.')
    }
    const { id } = user
    console.log(id, 'id')
    const token = await sankeyUserService.generateToken(email, id)
    return res.status(200).json({
      success: true,
      body: { user, token },
      message: 'User logged in successfully'
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

// User can place orders
const placeOrder = async (req, res) => {
  console.log('inside Place Order')
  try {
    const user = req.user
    const getUser = await sankeyUserService.getUser(user.id)
    const { _id, address, city } = getUser
    const orderName = req.body.orderName
    const order = await sankeyUserService.placeOrder(
      _id,
      orderName,
      address,
      city
    )
    return res.status(200).json({
      success: true,
      body: order,
      message: 'Order placed successfully'
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

// Get Orders using filters
const getOrders = async (req, res) => {
  try {
    const { searchKey, sortingKey, sortAsc, page, status, fromDate, toDate } = req.body
    const filteredOrders = await sankeyUserService.filterOrders(searchKey, sortingKey, sortAsc, page, status, fromDate, toDate)
    // console.log(filteredOrders, 'Filtered Orders')
    return res.status(200).json({
      success: true,
      data: filteredOrders,
      message: 'Filtered Orders retrieved!'
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

module.exports = {
  createUser,
  getUser,
  getAllUsers,
  userLogin,
  placeOrder,
  getOrders
}

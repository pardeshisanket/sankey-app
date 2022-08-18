const UserService = require('../services/user.services')
const { validationResult } = require('express-validator')

// Get all Users
const getAllUsers = async (req, res) => {
  try {
    console.log('in getall controller')
    const users = await UserService.getAllUsers()
    return res.status(200).json({
      success: true,
      data: users,
      message: 'Succesfully retrieved all Users!'
    })
  } catch (e) {
    console.log(e)
    return res.status(400).json({
      success: false,
      message: e.message
    })
  }
}

// Get a User
const getUser = async (req, res) => {
  try {
    console.log('in getUser controller')
    const id = req.params.id
    const user = await UserService.getUser(id)
    return res.status(200).json({
      success: true,
      data: user,
      message: 'Successfully retrieved a user!'
    })
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message
    })
  }
}

// Create a User
const addUser = async (req, res) => {
  try {
    const hasError = validationResult(req)
    if (!hasError.isEmpty()) {
      return res.send({ error: hasError.array() })
    }
    const body = req.body
    const addUser = await UserService.addUser(body)
    return res.status(201).json({
      success: true,
      data: addUser,
      message: 'User Added Successfully'
    })
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message
    })
  }
}

// Update a User
const updateUser = async (req, res) => {
  try {
    const hasError = validationResult(req)
    if (!hasError.isEmpty()) {
      return res.send({ error: hasError.array() })
    }
    const id = req.params.id
    const body = req.body
    const updateUser = await UserService.updateUser(id, body)
    return res.status(200).json({
      success: true,
      data: updateUser,
      message: 'User Updated Successfully'
    })
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message
    })
  }
}

// Delete a User
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id
    const deleteUser = await UserService.deleteUser(id)
    return res.status(200).json({
      success: true,
      data: deleteUser,
      message: 'User Deleted Successfully'
    })
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message
    })
  }
}

module.exports = {
  getAllUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser
}

const express = require('express')
const router = express.Router()
const userController = require('./controllers/user.controller')
const { body } = require('express-validator')

// Get all Users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(
    body('email').isEmail().withMessage('Must be a valid email id'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Must be atleast 6 chars long'),
    userController.addUser
  )

router
  .route('/:id')
  .get(userController.getUser)
  .put(
    body('email').isEmail().withMessage('Must be a proper email id'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Must be atleast 6 chars long'),
    userController.updateUser
  )
  .delete(userController.deleteUser)

module.exports = router

const express = require('express')
const router = express.Router()
const { body, check } = require('express-validator')

const sankeyUserController = require('./controllers/sankeyUser.controller')
const authorization = require('../../../middleware/authorization.middleware')

router
  .route('/')
  // Creating a user
  .post(
    check('email')
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Must enter a valid email id'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Must be atleast 6 chars long'),
    sankeyUserController.createUser
  )
  // Getting all Users
  .get(authorization, sankeyUserController.getAllUsers)

router
  .route('/filterOrders')
  // Retrieving orders by filters
  .post(authorization, sankeyUserController.getOrders)

router
  .route('/order')
  // Placing a Order
  .post(authorization, sankeyUserController.placeOrder)

router
  .route('/:id')
  // Get User using id
  .get(
    authorization,
    body().isEmpty().withMessage('User is deleted!'),
    sankeyUserController.getUser
  )

router
  .route('/login')
  // User logs in
  .post(
    check('email').isEmail().withMessage('Must enter a valid email id'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Must be atleast 6 chars long'),
    sankeyUserController.userLogin
  )

module.exports = router

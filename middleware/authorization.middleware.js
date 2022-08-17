const jwt = require('jsonwebtoken')
const config = require('../config/config')

// Authorization- Compares the Bearer token(for accessing APIs) with User Token
const authorization = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    if (token === null) return res.sendStatus(401)
    const decodedPayload = await jwt.verify(token, config.JWT_TOKEN)
    // console.log(decodedPayload, " Payload")
    req.user = decodedPayload
    next()
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

module.exports = authorization

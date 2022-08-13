const sankeyUserService = require("../services/sankeyUser.services");
const { validationResult } = require("express-validator");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const config = require("../../../../config/config");

// Create a sankeyUser
const createUser = async (req, res) => {
  try {
    let hasError = validationResult(req);
    if (!hasError.isEmpty()) {
      return res.send({ error: hasError.array() });
    }
    let body = req.body;
    req.body.password = await argon2.hash(req.body.password);
    let user = await sankeyUserService.createUser(body);
    return res.status(201).json({
      success: true,
      data: user,
      message: "Created SankeyUser Successfully!",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//Get a sankeyUser by ID
const getUser = async (req, res) => {
  try {
    let id = req.params.id;
    let user = await sankeyUserService.getUser(id);
    return res.status(200).json({
      success: true,
      data: user,
      message: "SankeyUser retrieved successfully!",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    let users = await sankeyUserService.getAllUsers();
    return res.status(200).json({
      success: true,
      data: users,
      message: "Retrieved all SankeyUsers successfully!",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// User logs in
const userLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await sankeyUserService.getloginUser(email, password);
    if (!user) {
      throw new Error("Please enter valid credentails.");
    }
    let token = await sankeyUserService.generateToken(email, password);
    return res.status(200).json({
      success: true,
      body: { user, token },
      message: "User logged in successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Authorization- Compares the Bearer token(for accessing APIs) with User Token
const authorization = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  try {
    const token = authHeader && authHeader.split(" ")[1];
    if (token === null) return res.sendStatus(401);
    let decoded = await jwt.verify(token, config.JWT_TOKEN);
    console.log(decoded, "decoded");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// User can place orders
const placeOrder = async (req,res) => {
  try {
    
  } catch (err) {
    
  }
}

module.exports = {
  createUser,
  getUser,
  getAllUsers,
  userLogin,
  authorization,
};

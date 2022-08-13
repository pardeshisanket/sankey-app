const sankeyUser = require("../../../../db/models/sankeyUser");
const config = require("../../../../config/config");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");


// Create UserService
const createUser = async (body) => {
  try {
    const addedUser = await sankeyUser.create(body);
    return addedUser;
  } catch (err) {
    throw Error("Error: " + err);
  }
};

// Get User with id
const getUser = async (id) => {
  try {
    const user = await sankeyUser.findOne({ _id: id, isDeleted: false });
    if (!user) {
      throw new Error("User is Deleted");
    }
    return user;
  } catch (err) {
    throw Error("Error: " + err);
  }
};

// Get AllUsers using aggregation
const getAllUsers = async () => {
  try {
    const users = await sankeyUser.aggregate([
      {
        $match: { isDeleted: false },
      },
    ]);
    return users;
  } catch (err) {
    throw Error("Error :" + err);
  }
};


// Generate Token when user wants to login
const generateToken = async (email, password) => {
  try {
    let jwtSecretKey = config.JWT_TOKEN;
    let user = {
      email: email,
      password: password,
    };
    const token = jwt.sign(user, jwtSecretKey);

    return token;
  } catch (err) {
    throw Error("Error :" + err);
  }
};


// Fetches user with correct credentials
const getloginUser = async (email, password) => {
  try {
    // Finds user with email
    let user = await sankeyUser.findOne({ email: email });
    encryptPassword = user.password;
    // Compares passwords
    if (await argon2.verify(encryptPassword, password)) {
      // password match
      return user;
    } else {
      // password did not match
      throw new Error("Please enter a valid password");
    }
  } catch (err) {
    throw Error("Error :" + err);
  }
};

module.exports = {
  createUser,
  getUser,
  getAllUsers,
  generateToken,
  getloginUser,
};

const User = require("../../../../db/models/user");

const getAllUsers = async () => {
  try {
    const users = await User.find()
    return users;
  } catch (err) {
    console.log(err)
    throw Error("Error: " + err);
  }
};

const getUser = async (userID) => {
  try {
    const user = await User.findById(userID);
    return user;
  } catch (err) {
    throw Error("Error: " + err);
  }
};

const addUser = async (body) => {
  try {
    const AddedUser = await User.create(body);
    return AddedUser;
  } catch (err) {
    throw Error("Error: " + err);
  }
};

const updateUser = async (userID, body) => {
  try {
    
    let updatedUser = await User.findByIdAndUpdate(userID,body,{new: true});
    return updatedUser;
  } catch (err) {
    throw Error("Error: " + err);
  }
};

const deleteUser = async (userID) => {
  try {
    let deletedUser = await User.findByIdAndDelete(userID);
    return deletedUser;
  } catch (err) {
    throw Error("Error: " + err);
  }
};

module.exports = {
  getAllUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
};

const express = require("express");
const router = express.Router();
const sankeyUserController = require("./controllers/sankeyUser.controller");
const { body, check } = require("express-validator");

router
  .route("/")
  // Creating a user
  .post(
    check("email")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("Must enter a valid email id"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Must be atleast 6 chars long"),
    sankeyUserController.createUser
  )

  // Getting all Users
  .get(
    sankeyUserController.authorization, 
    sankeyUserController.getAllUsers
  );

router
  .route("/:id")
  // Get User using id
  .get(
    sankeyUserController.authorization,
    body().isEmpty().withMessage("User is deleted!"),
    sankeyUserController.getUser
  );

router
  .route("/login")
  // User logs in
  .post(
    check("email").isEmail().withMessage("Must enter a valid email id"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Must be atleast 6 chars long"),
    sankeyUserController.userLogin
  );

module.exports = router;

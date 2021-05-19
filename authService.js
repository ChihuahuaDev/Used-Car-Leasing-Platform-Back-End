const express = require("express");
const router = express.Router();
const user = require("./models/user");
const bcrypt = require("bcryptjs");
const constants = require("./constant");
const jwt = require("./middleware/jwtParser");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// Signin
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  var errorList = [];
  var emailRegex =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  if (!email) {
    errorList.push({
      emailError: true,
      emailErrorMessage: "Email is required",
    });
  }
  if (email) {
    let valid = emailRegex.test(email);
    if (!valid) {
      errorList.push({
        emailError: true,
        emailErrorMessage: "Invalid Email",
      });
    }
  }
  if (!password) {
    errorList.push({
      passwordError: true,
      passwordErrorMessage: "Password is required",
    });
  }
  if (errorList.length > 0) {
    res.json({ status: "error", errorList: errorList });
  }
  let result = await user.findOne({ where: { email: email } });
  if (result != null) {
    if (bcrypt.compareSync(password, result.password)) {
      const id = result.id;
      const fullname = result.fullname;
      const email = result.email;
      const phonenumber = result.phonenumber;
      const level = result.level;
      const payload = { id, fullname, email, phonenumber, level };
      const token = jwt.sign(payload);
      res.json({
        result: constants.kResultOk,
        token: token,
        fullname: fullname,
        email: email,
        phonenumber: phonenumber,
        level: level,
        status: "success",
      });
    } else {
      res.json({
        status: "autherror",
        error: true,
        message: "Incorrect email or password",
      });
    }
  } else {
    res.json({
      status: "autherror",
      error: true,
      message: "Incorrect email or password",
    });
  }
});

// Signup
router.post("/signup", async (req, res) => {
  const { fullname, phonenumber, email, password, confirmPassword } = req.body;
  var errorList = [];
  var emailRegex =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  if (!fullname) {
    errorList.push({
      fullnameError: true,
      fullnameErrorMessage: "Your full name is required",
    });
  }
  if (!phonenumber) {
    errorList.push({
      phonunumberError: true,
      phonenumberErrorMessage: "Phonenumber is required",
    });
  }
  if (!email) {
    errorList.push({
      emailError: true,
      emailErrorMessage: "Email is required",
    });
  }
  if (email) {
    let valid = emailRegex.test(email);
    if (!valid) {
      errorList.push({
        emailError: true,
        emailErrorMessage: "Invalid Email",
      });
    }
  }
  if (!password) {
    errorList.push({
      passwordError: true,
      passwordErrorMessage: "Password is required",
    });
  }
  if (!confirmPassword) {
    errorList.push({
      passwordError: true,
      passwordErrorMessage: "Confirm Password is required",
    });
  }
  if (password != confirmPassword) {
    errorList.push({
      confirmPasswordError: true,
      confirmPasswordErrorMessage: "Must match with password field",
    });
  }
  if (errorList.length > 0) {
    res.json({ status: "error", errorList: errorList });
  }
  try {
    let result = await user.findOne({ where: { email: req.body.email } });
    if (result) {
      res.json({
        status: "emailerror",
        error: true,
        message: "This email is not available",
      });
    } else {
      req.body.password = bcrypt.hashSync(req.body.password, 8);
      let createResult = await user.create(req.body);
      res.json({ status: "success", message: "Success" });
    }
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      message: "Internal error please try again later",
    });
  }

  // Promise without async/await
  // user.create(req.body).then(result=>{
  //   res.json({result: constants.kResultOk, message: JSON.stringify(result)})
  // })
});

// Signup Admin
router.post("/signup/admin", async (req, res) => {
  try {
    req.body.password = bcrypt.hashSync(req.body.password, 8);
    req.body.level = "admin";
    let result = await user.create(req.body);
    res.json({ result: constants.kResultOk, message: JSON.stringify(result) });
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

// Get all users
router.get("/users", jwt.isAdmin, async (req, res) => {
  let result = await user.findAll();
  res.json(result);
});

// Delete user by ID
router.delete("/users/:id", jwt.isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let result = await user.findOne({ where: { id: id } });
    result = await user.destroy({ where: { id: id } });
    res.json({ result: constants.kResultOk, message: "Success" });
  } catch (error) {
    res.json({ result: constants.kResultNok, message: "Internal error" });
  }
});

// Search User by Keywords
router.get("/users/search/keyword/:keyword", jwt.isAdmin, async (req, res) => {
  try {
    const { keyword } = req.params;
    let result = await user.findAll({
      where: {
        [Op.or]: [
          { phonenumber: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } },
          { fullname: { [Op.like]: `%${keyword}%` } },
        ],
      },
    });
    res.json(result);
  } catch (error) {
    res.json({ message: "Not found" });
  }
});

// Search User by Phone Number
router.post("/users/search/phonenumber", jwt.isAdmin, async (req, res) => {
  try {
    let result = await user.findAll({
      where: { phonenumber: req.body.phonenumber },
    });
    res.json(result);
  } catch (error) {
    res.json({ message: "Not found" });
  }
});

// Search User by Email
router.post("/users/search/email", jwt.isAdmin, async (req, res) => {
  try {
    let result = await user.findAll({
      where: { email: req.body.email },
    });
    res.json(result);
  } catch (error) {
    res.json({ message: "Not found" });
  }
});

// Update User Info
router.put("/users", jwt.isAdmin, async (req, res) => {
  try {
    req.body.password = bcrypt.hashSync(req.body.password, 8);
    userInfo = {
      email: req.body.email,
      fullname: req.body.fullname,
      phonenumber: req.body.phonenumber,
      password: req.body.password,
      level: req.body.level,
    };
    let result = await user.update(userInfo, {
      where: { id: req.body.id },
    });
    console.log(result);
    if (result[0]) {
      res.json({
        status: "success",
        message: "Successfully Updated",
      });
    } else {
      res.json({
        status: "error",
        message: "User ID not found",
      });
    }
  } catch (error) {
    res.json({ status: "error", message: "Database connection issue" });
  }
});

module.exports = router;

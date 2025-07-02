const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../models/userSchema");
const cloudinary = require("../middlewares/cloudinary");
const fs = require("fs");

//======== signuP APIs ======

const signUp = async (req, res) => {
  const { name, email, password, age } = req.body;
  try {
    const existUser = await Users.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exist.",error: "Cannot create new user from this email." });
    }
    const saveImage = await cloudinary.uploader.upload(req.file.path, {
      folder: "user_profiles",
      resource_type: "image",
    });
    fs.unlinkSync(req.file.path);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({
      name,
      email,
      password: hashedPassword,
      age,
      profileImageUrl: saveImage.secure_url,
    });
    const result = await newUser.save();
    res
      .status(201)
      .send({message: "Sign up successfully.", result: result });
  } catch (err) {
    res.status(400).send({ message: "Error in sign Up.", error: err.message });
  }
};
//=============== login  user Apis ===========b
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existUser = await Users.findOne({ email });
    if (!existUser) {
      return res
        .status(400)
        .send({ message: "User is not found.", error: "No user with given email."});
    }
    if (existUser.isDeleted) {
      return res
        .status(400)
        .send({ message: "Account is deleted. Please contact support." });
    }
    const passwordMatch = await bcrypt.compare(password, existUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Please enter correct password.",error: "Invalid password." });
    }
    const token = jwt.sign({ userId: existUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(201).send({message: "Login successfully", result: token });
  } catch (err) {
    res.status(400).send({ message: "Error in login.", message: err.message });
  }
};


//=========== getUserList ======

const usersList = async (req, res) => {
  try {
    const list = await Users.find({isDeleted :false});
    res.status(201).json({ message: "Users list is found.", result: list});
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error in getting users list.", error: err.message });
  }
};

//=========== get singleUser ======

const singleUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Users.findById({ userId});
    if (!user) {
      return res.status(404).send({ message: "User is not found.", error: "No user with given ID." });
    }
    res.status(201).json({message: "User is found.", result: user});
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error in finding single user.", error: err.message });
  }
};

// ===== singleName ===========

const singleName = async (req, res) => {
  try {
    const name = req.query.userName;
    const singleUserName = await Users.find({ name });
    if (!singleUserName) {
      return res.status(404).send({ message: "User is not in the database.",error: "No user with given name."});
    }
    res.status(201).send({ message: "User  is found.", result: singleUserName });
  } catch (err) {
    res
      .status(400)
      .json({
        message: " Error in finding singleName user.",
        error: err.message,
      });
  }
};

// ======== update user =========

const userUpdate = async (req, res) => {
  try {
    const userUpdated = await Users.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    if (!userUpdated) {
      return res.status(404).send({ message: "user not found.",error: "No user with given ID." });
    }
    res.status(201).json({message: "User is updated.", result: userUpdated});
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating user.", err: error.message });
  }
};

//========== soft_Delete user =============

const userSoftDelete = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).send({ message: "User is not found.", error: "No user with given ID" });
    }
    if(user.isDeleted) {
        return res.status(400).send({ message: "User is already deleted.", error: " Cannot delete again."})
    }
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();
    res.status(201).json({ message: "User soft deleted successfully.", result: user });
} catch (error)
{
    res.status(400).json({ message: "Error deleting user.", err: error.message });}
};

module.exports = {
  signUp,
  login,
  usersList,
  singleUser,
  singleName,
  userUpdate,
  userSoftDelete,
};

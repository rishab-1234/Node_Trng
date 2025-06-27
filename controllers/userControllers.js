const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/userSchema');
const cloudinary = require('../middlewares/cloudinary');
const fs = require('fs');


//======== signuP APIs ====== 

const signUp = async (req, res) => {
    const { name, email, password, age } = req.body;
    try {
        const existUser = await Users.findOne({ email });
        if (existUser) {
            return res.status(400).json({ message: "User already exist." });
        }
        const saveImage = await cloudinary.uploader.upload(req.file.path, {
            folder: 'user_profiles',
            resource_type: 'image'
        });
        fs.unlinkSync(req.file.path);

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Users({ name, email, password: hashedPassword, age, profileImageUrl: saveImage.secure_url, });
        const result = await newUser.save();
        res.status(201).send({ status: 201, message: "Sign up successfully.", result });
    } catch (err) {
        res.status(400).send({ status: 400, message: err });
    };
}
//=============== login  user Apis ===========b
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existUser = await Users.findOne({ email });

        if (!existUser) {
            return res.status(400).send({ message: "Email is required." });
        }
        const passwordMatch = await bcrypt.compare(password, existUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Wrong password' });
        }
        // Generate Token 
        const token = jwt.sign({ userId: existUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' }
        );

        res.status(201).send({ status: 201, message: "Login succesfully", token });
    } catch (err) {
        res.status(400).send({ status: 400, message: err.message });
    }
}


//=========== getUserList ======

const usersList = async (req, res) => {
    try {
        const list = await Users.find();
        res.status(201).json(list);
    }
    catch (err) {
        res.status(400).json({
            error: err.message
        })
    }
}

//=========== get singleUser ======
const singleUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).send('User is not found.');
        }
        res.status(201).json(user);
    }
    catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
}


// ===== singleName ===========

const singleName = async (req, res) => {
    try {
        const userName = await Users.find({ name: req.params.userName });
        if (!userName) {
            return res.status(404).send('User is not in the database.');
        }
        res.status(201).send({ message: "user found", userName });
    } catch (err) {
        res.status(400).json({ error: err.messag });
    }
}
// ======== update user =========

const userUpdate = async (req, res) => {
    try {
        const userUpdated = await Users.findByIdAndUpdate(req.params.id,
            { $set: req.body }, { new: true });
        if (!userUpdated) {
            return res.status(404).send("user not found.");
        }
        res.status(201).json(userUpdated);
    } catch (error) {
        res.status(400).json({ err: error.message });
    }
}

//========== delete user =============

const userDelete = async (req, res) => {
    try {
        const userDeleted = await Users.findByIdAndDelete(req.params.id);
        if (!userDeleted) { return res.status(404).send('User is not found'); }
        res.status(201).json("Deleted Success.", userDeleted);
    } catch (error) {
        res.status(400).json({ err: error.message });
    }
}


module.exports = { signUp, login, usersList, singleUser, singleName, userUpdate, userDelete };


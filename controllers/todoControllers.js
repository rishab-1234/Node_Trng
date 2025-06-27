const todo = require('../models/todoSchema');
const cloudinary = require('../middlewares/cloudinary');
const fs = require('fs');


// -------- sign up todo ------------------ //

const signupTodo = async (req, res) => {
    try {
        const { title, description } = req.body;
        const existingTodo = await todo.findOne({
            title: title.trim(),
            userId: req.user.id
        });
        if (existingTodo) {
            return res.status(400).json({ error: 'Todo with this title already exists for this user.' });
        }
        const imageUrls = await Promise.all(
            req.files.map(async (file) => {
                const multipleImages = await cloudinary.uploader.upload(file.path, {
                    folder: 'todo_profiles',
                    resource_type: 'image',
                });
                fs.unlinkSync(file.path);
                return multipleImages.secure_url;
            })
        );
        const Todo = new todo({
            title,
            description,
            images: imageUrls,
            userId: req.user.id
        });
        const saveTodo = await Todo.save();
        res.status(201).send({ status: 200, message: "Todo signed successfully.", "result": saveTodo });
    } catch (err) {
        res.status(400).send({ status: 400, message: err.message });
    }
}

const UserTodo = async (req, res) => {
    try {
        const todos = await todo.find();
        res.status(200).json(todos);
    } catch (err) {
        res.status(401).json(err);
    }
}

const singleUserTodo = async (req, res) => {
    try {
        const todoId = req.params.id;
        const Todo = await todo.findOne({ _id: todoId, userId: req.user.id });
        if (!Todo) { return res.status(404).json({ error: 'Not found' }); }
        res.json({ "result": Todo });
    }
    catch (err) {
        res.status(400).send(err);
    }
};
const updateTodo = async (req, res) => {
    try {
        const Todo = await todo.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!Todo) { return res.status(404).json({ error: 'Not found' }); }
        res.json({ message: 'Todo updated', "result": Todo });
    }
    catch (err) {
        res.status(404).send(err);
    }
}

const deleteTodo = async (req, res) => {
    try {
        const Todo = await todo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!Todo) { return res.status(404).json({ error: 'Not found' }); }
        res.json({ message: 'Todo deleted.' });
    } catch (err) {
        res.status(404).send(err);
    }
}

const getItems = async (req, res) => {
    try {
        const { title, description, completed } = req.query;
        const query = {};
        query.userId = req.user.id;
        if (title) {
            query.title = new RegExp(`\\b${title}\\b`, 'i');
        };
        if (description) {
            query.description = new RegExp(`\\b${description}\\b`, 'i');
        };
        if (completed !== undefined) {
            query.completed = completed === 'true'
        };
        const todoName = await todo.find(query).select({
            description: 1, title: 1,
            completed: 1, _id: 0
        }).populate('userId', 'name email');
        if (!todoName) { return res.status(404).json({ error: 'not found' }); }
        res.json({ message: 'Todo is found.', 'result': todoName });
    } catch (err) {
        res.status(400).send({ status: 400, message: err.message });
    }
}

module.exports = { signupTodo, UserTodo, singleUserTodo, updateTodo, deleteTodo, getItems };

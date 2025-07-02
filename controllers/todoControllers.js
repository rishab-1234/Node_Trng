const todo = require("../models/todoSchema");
const cloudinary = require("../middlewares/cloudinary");
const fs = require("fs");


//======== createTodo APIs ========
const createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const existingTodo = await todo.findOne({
      title: title.trim(),
      userId: req.user.id,
    });
    if (existingTodo) {
      return res
        .status(400)
        .json({
          message: "Todo with this title already exists for this user.",error: "Cannot create todo with same title."
        });
    }
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        const multipleImages = await cloudinary.uploader.upload(file.path, {
          folder: "todo_profiles",
          resource_type: "image",
        });
        fs.unlinkSync(file.path);
        return multipleImages.secure_url;
      }),
    );
    const Todo = new todo({
      title,
      description,
      images: imageUrls,
      userId: req.user.id,
    });
    const saveTodo = await Todo.save();
    res
      .status(201)
      .send({message: "Todo is created successfully.",result: saveTodo});
  } catch (err) {
    res.status(400).send({message: "Error in creating todo.", error: err.message });
  }
};


//======== UserTodo APIs ========
const UserTodo = async (req, res) => {
  try {
    const todos = await todo.find({isDeleted: false});
    res.status(201).json({message: "Todo is found.", result: todos});
  } catch (err) {
    res.status(401).json({message: "Error in getting todos.", error: err.message});
  }
};

//======== singleUserTodo APIs ========
const singleUserTodo = async (req, res) => {
  try {
    const todoId = req.params.id;
    const Todo = await todo.findOne({
      _id: todoId,
      userId: req.user.id,
    });
    if (!Todo) {
      return res.status(404).json({ message: " Todo is not found.",error: "No todo with given ID." });
    }
    res.status(200).json({ message: "Todo is found.",result: Todo });
  } catch (err) {
    res.status(400).send({ message: "Error in finding todo.", error: err.message});
  }
};

//======== updateTodo APIs ========

const updateTodo = async (req, res) => {
  try {
    const Todo = await todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true },
    );
    if (!Todo) {
      return res.status(404).json({ message: "Todo is not found.",error: " No todo with given ID." });
    }
    res.json({ message: "Todo is updated.", result: Todo });
  } catch (err) {
    res.status(404).send({ message: "Error in updating todo.",error: err.message });
  }
};


//======== todoSoftDelete APIs ========
const todoSoftDelete = async (req, res) => {
  try {
    const _id = req.params.id;
    const Todo = await todo.findById({_id});
    if (!Todo) {
      return res.status(404).json({ message: " Todo is not found.", error: "No todo with given ID."});
    }
    if(Todo.isDeleted) {
      return res.status(400).send({message: "Todo is already deleted.",error: " Cannot delete again."})
    }
    Todo.isDeleted = true;
    Todo.deletedAt = new Date();
    await Todo.save();
    res.status(201).json({ message: "Todo soft deleted successfully.",result: Todo});
  } catch (err) {
    res.status(404).send({ message: "Error in todo soft delete.",error: err.message });
  }
};


//======== getItems APIs ========
const getItems = async (req, res) => {
  try {
    const { title, description, completed } = req.query;
    const query = {};
    query.userId = req.user.id;
    if (title) {
      query.title = new RegExp(`\\b${title}\\b`, "i");
    }
    if (description) {
      query.description = new RegExp(`\\b${description}\\b`, "i");
    }
    if (completed !== undefined) {
      query.completed = completed === "true";
    }
    const todoName = await todo
      .find(query)
      .select({
        description: 1,
        title: 1,
        completed: 1,
        _id: 0,
      })
      .populate("userId", "name email");
    if (!todoName || todoName.length === 0) {
      return res.status(404).json({message: "Todo is not found.",error: "No todo with given ID." });
    }
    res.json({ message: "Todo is found.", result: todoName });
  } catch (err) {
    res.status(400).send({ message: "Error in getting todo.", error: err.message });
  }
};

module.exports = {
  createTodo,
  UserTodo,
  singleUserTodo,
  updateTodo,
  todoSoftDelete,
  getItems,
};

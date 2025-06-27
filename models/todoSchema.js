const mongoose = require("mongoose");
const Users = require("./userSchema");

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
         trim: true,
    },
    description: {
        type: String,
         trim: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    images:[String],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Users
    },
    dueDate: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true }
);

const todo = mongoose.model("todo", todoSchema);
module.exports = todo;
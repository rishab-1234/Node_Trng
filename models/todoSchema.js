const mongoose = require("mongoose");
const Users = require("./userSchema");

const todoSchema = new mongoose.Schema(
  {
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
      default: false,
    },
    images: [String],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Users,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const todo = mongoose.model("todo", todoSchema);
module.exports = todo;

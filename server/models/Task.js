const mongoose = require("mongoose")

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["pending", "completed", "in-progress"], default: "pending" },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Task", TaskSchema)
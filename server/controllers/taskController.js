const Task = require("../models/Task")
const jwt = require("jsonwebtoken")
exports.createTask = async (req, res) => {

    try {
        const { title, description, priority } = req.body
        const task = await Task.findOne({ title })
        if (task) {
            return res.status(400).json({ message: "Task already exists" })
        }
        const newTask = new Task({ title, description, priority })
        await newTask.save()
        res.status(201).json({ message: "Task created successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params
        const { title, description, status, priority } = req.body
        const task = await Task.findOne({ _id: id })
        if (!task) {
            return res.status(404).json({ message: "Task not found" })
        }
        task.title = title
        task.description = description
        task.status = status
        task.priority = priority
        await task.save()
        res.status(200).json({ message: "Task updated successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params
        const task = await Task.findByIdAndDelete(id)
        if (!task) {
            return res.status(404).json({ message: "Task not found" })
        }
        res.status(200).json({ message: "Task deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
        if (!tasks) {
            return res.status(404).json({
                success: false,
                message: "tasks not found",
            });
        }

        res.status(200).json({
            success: true,
            data: tasks,
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}   
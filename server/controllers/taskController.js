const Task = require("../models/Task")
const User = require("../models/User")
const jwt = require("jsonwebtoken")
exports.createTask = async (req, res) => {
    try {
        const { title, description, priority, assignedTo } = req.body
        const task = await Task.findOne({ title })
        if (task) {
            return res.status(400).json({ message: "Task already exists" })
        }
        const newTask = new Task({
            title,
            description,
            priority,
            createdBy: req.user.id,
            assignedTo: assignedTo || null
        })
        const savedTask = await newTask.save()

        if (assignedTo && assignedTo !== req.user.id && req.io) {
            const sender = await User.findById(req.user.id)
            if (sender) {
                req.io.to(assignedTo).emit("notification", {
                    type: "task_assigned",
                    task: savedTask,
                    message: `${sender.name} assigned a new task to you: "${title}"`
                })
            }
        }

        res.status(201).json({ message: "Task created successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params
        const { title, description, status, priority, assignedTo } = req.body
        const task = await Task.findOne({ _id: id })
        if (!task) {
            return res.status(404).json({ message: "Task not found" })
        }

        const isCreator = task.createdBy.toString() === req.user.id
        const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user.id

        const previousAssignedTo = task.assignedTo ? task.assignedTo.toString() : null

        if (!isCreator && isAssignee) {
            // Assignee can only update the status field
            task.status = status
        } else if (isCreator) {
            // Creator can update everything
            task.title = title
            task.description = description
            task.status = status
            task.priority = priority
            task.assignedTo = assignedTo || null
        } else {
            return res.status(403).json({ message: "You are not authorized to update this task" })
        }

        const savedTask = await task.save()

        if (req.io) {
            const updater = await User.findById(req.user.id)
            if (updater) {
                const currentAssignedTo = savedTask.assignedTo ? savedTask.assignedTo.toString() : null
                if (isCreator && currentAssignedTo && currentAssignedTo !== previousAssignedTo && currentAssignedTo !== req.user.id) {
                    req.io.to(currentAssignedTo).emit("notification", {
                        type: "task_assigned",
                        task: savedTask,
                        message: `${updater.name} assigned a task to you: "${savedTask.title}"`
                    })
                } else {
                    const targetUser = req.user.id === savedTask.createdBy.toString()
                        ? (savedTask.assignedTo ? savedTask.assignedTo.toString() : null)
                        : savedTask.createdBy.toString()

                    if (targetUser) {
                        req.io.to(targetUser).emit("notification", {
                            type: "task_updated",
                            task: savedTask,
                            message: `Task "${savedTask.title}" was updated to "${savedTask.status}" by ${updater.name}`
                        })
                    }
                }
            }
        }

        res.status(200).json({ message: "Task updated successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params
        const task = await Task.findById(id)
        if (!task) {
            return res.status(404).json({ message: "Task not found" })
        }

        // Only the creator can delete the task
        if (task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the task creator can delete this task" })
        }

        await Task.findByIdAndDelete(id)
        res.status(200).json({ message: "Task deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [
                { createdBy: req.user.id },
                { assignedTo: req.user.id }
            ]
        })
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")

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
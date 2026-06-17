const Task = require("../models/Task")
const User = require("../models/User")
const { redisClient } = require("../config/redis")

// Cache TTL: 5 minutes
const CACHE_TTL = 300

// Helper: build a per-user cache key
const taskCacheKey = (userId) => `tasks:${userId}`

// Helper: delete cache for all users affected by a task (creator + assignee)
const invalidateTaskCache = async (creatorId, assigneeId = null) => {
    try {
        const keys = [`tasks:${creatorId}`]
        if (assigneeId && assigneeId.toString() !== creatorId.toString()) {
            keys.push(`tasks:${assigneeId}`)
        }
        await Promise.all(keys.map((k) => redisClient.del(k)))
    } catch (err) {
        console.warn("Redis cache invalidation failed:", err.message)
    }
}

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

        // Invalidate cache for creator and assignee
        await invalidateTaskCache(req.user.id, assignedTo)

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
            task.status = status
        } else if (isCreator) {
            task.title = title
            task.description = description
            task.status = status
            task.priority = priority
            task.assignedTo = assignedTo || null
        } else {
            return res.status(403).json({ message: "You are not authorized to update this task" })
        }

        const savedTask = await task.save()

        // Invalidate cache for creator, old assignee, and new assignee
        const newAssignedTo = savedTask.assignedTo ? savedTask.assignedTo.toString() : null
        await invalidateTaskCache(task.createdBy.toString(), previousAssignedTo)
        if (newAssignedTo && newAssignedTo !== previousAssignedTo) {
            await invalidateTaskCache(task.createdBy.toString(), newAssignedTo)
        }

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

        if (task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the task creator can delete this task" })
        }

        const assigneeId = task.assignedTo ? task.assignedTo.toString() : null
        await Task.findByIdAndDelete(id)

        // Invalidate cache for creator and assignee
        await invalidateTaskCache(req.user.id, assigneeId)

        res.status(200).json({ message: "Task deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getTasks = async (req, res) => {
    const cacheKey = taskCacheKey(req.user.id)

    try {
        // 1. Try Redis cache first
        try {
            const cached = await redisClient.get(cacheKey)
            if (cached) {
                console.log(`[Redis] Cache HIT for ${cacheKey}`)
                return res.status(200).json({
                    success: true,
                    data: JSON.parse(cached),
                    fromCache: true,
                })
            }
            console.log(`[Redis] Cache MISS for ${cacheKey}`)
        } catch (redisErr) {
            console.warn("Redis read failed, falling back to MongoDB:", redisErr.message)
        }

        // 2. Query MongoDB
        const tasks = await Task.find({
            $or: [
                { createdBy: req.user.id },
                { assignedTo: req.user.id }
            ]
        })
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")

        // 3. Store result in Redis
        try {
            await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(tasks))
        } catch (redisErr) {
            console.warn("Redis write failed:", redisErr.message)
        }

        res.status(200).json({
            success: true,
            data: tasks,
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
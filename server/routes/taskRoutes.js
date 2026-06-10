const express = require("express")
const { createTask, updateTask, deleteTask, getTasks } = require("../controllers/taskController")
const protect = require("../middleware/authMiddleware")
const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the task
 *           example: Complete homework
 *         description:
 *           type: string
 *           description: Detailed description of the task
 *           example: Math exercises on page 42
 *         priority:
 *           type: string
 *           enum: [high, medium, low]
 *           description: Task priority level
 *           example: medium
 *         assignedTo:
 *           type: string
 *           description: The ID of the user assigned to this task
 *           example: 60d21b4667d0d8992e610c85
 *     TaskUpdateInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the task
 *           example: Complete homework
 *         description:
 *           type: string
 *           description: Detailed description of the task
 *           example: Math exercises on page 42
 *         status:
 *           type: string
 *           enum: [pending, completed, in-progress]
 *           description: Task status
 *           example: in-progress
 *         priority:
 *           type: string
 *           enum: [high, medium, low]
 *           description: Task priority level
 *           example: medium
 *         assignedTo:
 *           type: string
 *           description: The ID of the user assigned to this task
 *           example: 60d21b4667d0d8992e610c85
 *     TaskResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The task ID
 *         title:
 *           type: string
 *           description: The title of the task
 *         description:
 *           type: string
 *           description: Detailed description of the task
 *         status:
 *           type: string
 *           enum: [pending, completed, in-progress]
 *           description: Task status
 *         priority:
 *           type: string
 *           enum: [high, medium, low]
 *           description: Task priority level
 *         createdBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         assignedTo:
 *           type: object
 *           nullable: true
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date of task creation
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task created successfully
 *       400:
 *         description: Task already exists or invalid data
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.post("/", protect, createTask)

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdateInput'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.put("/:id", protect, updateTask)

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, deleteTask)

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Retrieve all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskResponse'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get("/", protect, getTasks)

module.exports = router
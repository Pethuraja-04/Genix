const express = require("express")
const { register, login, logout, getProfile, sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, searchUsers } = require("../controllers/authController")
const protect = require("../middleware/authMiddleware")
const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: The user's name
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password
 *           example: securePassword123
 *     UserLoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password
 *           example: securePassword123
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The user ID
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           description: The user's email address
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Date of registration
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *       400:
 *         description: User already exists or validation error
 *       500:
 *         description: Server error
 */
router.post("/register", register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT authorization token
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Invalid password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/login", login)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and blacklist their JWT in Redis
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Not authorized
 */
router.post("/logout", protect, logout)

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Not authorized or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/profile", protect, getProfile)

/**
 * @swagger
 * /api/auth/connections/request:
 *   post:
 *     summary: Send a connection request to another user by email
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: friend@example.com
 *     responses:
 *       200:
 *         description: Connection request sent successfully
 *       400:
 *         description: Invalid input or connection state error
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.post("/connections/request", protect, sendConnectionRequest)

/**
 * @swagger
 * /api/auth/connections/accept:
 *   post:
 *     summary: Accept a connection request from a user
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requesterId
 *             properties:
 *               requesterId:
 *                 type: string
 *                 example: 60d21b4667d0d8992e610c85
 *     responses:
 *       200:
 *         description: Connection request accepted
 *       400:
 *         description: No pending request
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.post("/connections/accept", protect, acceptConnectionRequest)

/**
 * @swagger
 * /api/auth/connections/reject:
 *   post:
 *     summary: Reject/cancel a connection request from a user
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requesterId
 *             properties:
 *               requesterId:
 *                 type: string
 *                 example: 60d21b4667d0d8992e610c85
 *     responses:
 *       200:
 *         description: Connection request rejected
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.post("/connections/reject", protect, rejectConnectionRequest)

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Search for other users to connect with
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (name or email)
 *     responses:
 *       200:
 *         description: A list of search results
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 */
router.get("/users", protect, searchUsers)

module.exports = router
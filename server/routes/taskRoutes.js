const express = require("express")
const {createTask,updateTask,deleteTask,getTasks} = require("../controllers/taskController")
const protect = require("../middleware/authMiddleware")
const router = express.Router()

router.post("/",protect,createTask)
router.put("/:id",protect,updateTask)
router.delete("/:id",protect,deleteTask)
router.get("/",protect,getTasks)

module.exports = router
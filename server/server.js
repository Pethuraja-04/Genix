require("dotenv").config();

const express = require("express")
const cors = require("cors")

const connectDB = require("./config/db");

connectDB();

const app = express()
app.use(express.json())
app.use(cors())

const authRoutes = require("./routes/authRoutes")
const taskRoutes = require("./routes/taskRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)

app.listen(process.env.PORT, () => {
  console.log(
    `Server Running On Port ${process.env.PORT}`
  );
});
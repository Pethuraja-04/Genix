require("dotenv").config();

const express = require("express")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")

const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

connectDB();
connectRedis();

const app = express()
app.use(express.json())
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
})

// Join room for connected users
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });
});

// Middleware to attach socket.io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

const authRoutes = require("./routes/authRoutes")
const taskRoutes = require("./routes/taskRoutes")
const setupSwagger = require("./swagger")

app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)

setupSwagger(app)

server.listen(process.env.PORT, () => {
  console.log(
    `Server Running On Port ${process.env.PORT}`
  );
});
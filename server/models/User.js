const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
})

module.exports = mongoose.model("User", UserSchema)
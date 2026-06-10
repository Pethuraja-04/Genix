const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
exports.register = async (req, res) => {

    try {
        const { name, email, password } = req.body
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ name, email, password: hashedPassword })
        await newUser.save()
        res.status(201).json({ message: "User created successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" })
        res.status(200).json({ message: "Login successful", token, "user": { _id: user._id, name: user.name, email: user.email } })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            .populate("connections", "name email")
            .populate("sentRequests", "name email")
            .populate("receivedRequests", "name email")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.sendConnectionRequest = async (req, res) => {
    console.log(req,"reqqqqqqqqqqqqqqqqqqqqqqqqqqq")
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const recipient = await User.findOne({ email });
        if (!recipient) {
            return res.status(404).json({ message: "User not found" });
        }
        if (recipient._id.toString() === req.user.id) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }
        const sender = await User.findById(req.user.id);
        
        // Check if already connected
        if (sender.connections.includes(recipient._id)) {
            return res.status(400).json({ message: "Already connected" });
        }
        // Check if request already sent
        if (sender.sentRequests.includes(recipient._id)) {
            return res.status(400).json({ message: "Connection request already sent" });
        }
        // Check if there is an incoming request from them
        if (sender.receivedRequests.includes(recipient._id)) {
            return res.status(400).json({ message: "They have already sent you a connection request. Please accept it." });
        }

        sender.sentRequests.push(recipient._id);
        recipient.receivedRequests.push(sender._id);

        await sender.save();
        await recipient.save();

        if (req.io) {
            req.io.to(recipient._id.toString()).emit("notification", {
                type: "connection_request",
                sender: {
                    _id: sender._id,
                    name: sender.name,
                    email: sender.email
                },
                message: `${sender.name} sent you a connection request.`
            });
        }

        res.status(200).json({ message: "Connection request sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.acceptConnectionRequest = async (req, res) => {
    console.log(req,"reqqqqqqqqqqqqqqqqqqqqqqqqqqq")
    try {
        const { requesterId } = req.body;
        if (!requesterId) {
            return res.status(400).json({ message: "Requester ID is required" });
        }

        const user = await User.findById(req.user.id);
        const requester = await User.findById(requesterId);

        if (!requester) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if there is a received request
        if (!user.receivedRequests.includes(requesterId)) {
            return res.status(400).json({ message: "No pending request from this user" });
        }

        // Remove from requests
        user.receivedRequests = user.receivedRequests.filter(id => id.toString() !== requesterId);
        requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== req.user.id);

        // Add to connections
        user.connections.push(requesterId);
        requester.connections.push(req.user.id);

        await user.save();
        await requester.save();

        if (req.io) {
            req.io.to(requesterId).emit("notification", {
                type: "connection_accepted",
                acceptor: {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                },
                message: `${user.name} accepted your connection request.`
            });
        }

        res.status(200).json({ message: "Connection request accepted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.rejectConnectionRequest = async (req, res) => {
        console.log(req,"reqqqqqqqqqqqqqqqqqqqqqqqqqqq")
    try {
        const { requesterId } = req.body;
        if (!requesterId) {
            return res.status(400).json({ message: "Requester ID is required" });
        }

        const user = await User.findById(req.user.id);
        const requester = await User.findById(requesterId);

        if (!requester) {
            return res.status(404).json({ message: "User not found" });
        }

        user.receivedRequests = user.receivedRequests.filter(id => id.toString() !== requesterId);
        requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== req.user.id);

        await user.save();
        await requester.save();

        res.status(200).json({ message: "Connection request rejected" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        const query = q 
            ? { 
                $and: [
                    { _id: { $ne: req.user.id } },
                    { $or: [
                        { name: { $regex: q, $options: "i" } },
                        { email: { $regex: q, $options: "i" } }
                    ]}
                ]
              }
            : { _id: { $ne: req.user.id } };

        const users = await User.find(query).select("name email");
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../src/modules/auth/auth.routes"));
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "API Running",
    });
});
router.get("/auth-test", (req, res) => {
    res.send("Auth test works");
});
exports.default = router;

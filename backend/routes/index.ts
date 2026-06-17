import { Router } from "express";
import authRoutes from "../src/modules/auth/auth.routes";

const router = Router();
router.use("/auth", authRoutes);
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API Running",
  });
});

export default router;
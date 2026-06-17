import { Router } from "express";

import { register } from "./auth.controller";

import { validate } from "../../middleware/validate.middleware";

import { registerSchema } from "./auth.validation";

const router = Router();

router.get(
  "/register",
//   validate(registerSchema),
  register
);

export default router;
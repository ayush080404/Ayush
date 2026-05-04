import express from "express";
import { login, register } from "./auth.controller.js";

const router = express.Router();

/**
 * DO NOT use router.use("/auth", ...) here
 * This file ONLY defines auth endpoints
 */

router.post("/login", login);
router.post("/register", register);

export default router;
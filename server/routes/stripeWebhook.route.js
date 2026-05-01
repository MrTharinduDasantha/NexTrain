import { Router } from "express";
import express from "express";
import { stripeWebhook } from "../controllers/stripeWebhook.controller.js";

const router = Router();

/**
 * This route MUST receive the raw, unparsed body for Stripe's
 * signature verification to work. We attach `express.raw` here, and in
 * server.js we mount this router BEFORE the global `express.json()`.
 */
router.post("/", express.raw({ type: "application/json" }), stripeWebhook);

export default router;

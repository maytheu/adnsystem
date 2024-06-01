import { isAuthenticated } from "@apps/core";
import { Router } from "express";
import paymentController from "./payment.controller";

const router = Router()

router.post('/credit', isAuthenticated, paymentController.credit)
router.post('/debit', isAuthenticated)
router.post('/notify_insufficient', isAuthenticated)

export default router
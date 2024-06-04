import { isAuthenticated } from "@apps/core";
import { Router } from "express";
import PaymentController from "./payment.controller";

const router = Router()

router.post('/credit', isAuthenticated, PaymentController.credit)
router.post('/debit', isAuthenticated, PaymentController.debit)
router.post('/webhook', PaymentController.webhook)
router.get('/verify/:ref', PaymentController.verify)

export default router
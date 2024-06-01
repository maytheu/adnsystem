import { Router } from "express";
import Authcontroller from './auth.controller'

const router = Router()

router.post('/login', Authcontroller.login)
router.post('/signup', Authcontroller.signup)

export default router
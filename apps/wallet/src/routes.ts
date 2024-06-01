import { Router } from "express";
import {isAuthenticated} from '@apps/core'

const router = Router()

router.get('/credit', isAuthenticated)
// router.post('/signup', Authcontroller.signup)

export default router 
import { isAuthenticated } from '@apps/core';
import { Router } from 'express';
import UserController from './user.controller';

const router = Router();

router
  .route('/profile')
  .get(isAuthenticated, UserController.profile)
  .put(isAuthenticated, UserController.updateProfile);

export default router;

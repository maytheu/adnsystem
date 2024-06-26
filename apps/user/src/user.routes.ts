import { isAuthenticated } from '@apps/core';
import { Router } from 'express';
import UserController from './user.controller';
import { channel, USER, mqServer } from '@apps/queue';
import userService from './user.service';

const router = Router();

mqServer(USER).then(() => {
  channel.consume(USER, async (data) => {
    const val = JSON.parse(data.content);
    await userService.user(+val.userId, val.action);
    channel.ack(data);
  });
});

router
  .route('/profile')
  .get(isAuthenticated, UserController.profile)
  .put(isAuthenticated, UserController.updateProfile);

export default router;

import { Controller, IGetUserAuthInfoRequest } from '@apps/core';
import { NextFunction, RequestHandler, Response } from 'express';
import userService from './user.service';
import { validateUserProfile } from './user.validation';
import { AppError } from '@apps/error';
import { USER, channel } from '@apps/queue';

class UserController extends Controller {
  profile = async (
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.user;

      const user = await userService.profile(+id);
      if (user instanceof Error) return next(user);

      this.sendResp(res, 'User Information', { profile: user });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = validateUserProfile(req.body);
      if (error) return next(new AppError(error.details[0].message, 422));

      const { id } = req.user;
      req.body.id = +id;
      const data = await userService.updateProfile(req.body);
      if (data instanceof Error) return next(data);

      this.sendResp(res, 'Profile updated', { ...req.body });
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();

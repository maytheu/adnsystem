import { RequestHandler } from 'express';

import { Controller } from '@apps/core';
import { validateLoginData, validateSignupData } from './validator';
import { AppError } from '@apps/error';
import AuthService from './service';

class Authcontroller extends Controller {
  login: RequestHandler = async (req, res, next) => {
    try {
      const { error } = validateLoginData(req.body);
      if (error) return next(new AppError('Validation failed', 422));

      const data = await AuthService.login(req.body);
      if (data instanceof AppError || data instanceof Error) return next(data);

      this.sendResp(res, '', {token:data});
    } catch (error) {
      next(error);
    }
  };

  signup: RequestHandler = async (req, res, next) => {
    try {
      const { error } = validateSignupData(req.body);
      if (error) return next(new AppError('Validation failed', 422));

      const data = await AuthService.signup(req.body);
      if (data instanceof AppError || data instanceof Error) return next(data);

      this.sendCreatedResp(res, 'Account created successfully', { token: data });
    } catch (error) {
      next(error);
    }
  };
}

export default new Authcontroller();

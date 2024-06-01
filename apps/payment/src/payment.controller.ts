import { Controller, IGetUserAuthInfoRequest } from '@apps/core';
import { NextFunction, Response } from 'express';
import { amountValidation } from './payment.validator';
import { AppError } from '@apps/error';
import paymentService from './payment.service';

class PaymentCtroller extends Controller {
  credit = async (
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = amountValidation(req.body);
      if (error) return next(new AppError('Validation failed', 422));

      const { id } = req.user;
      req.body.userId = +id;
      const data = await paymentService.credit(req.body);
      if (data instanceof Error) return next(data);
    console.log(data);
    

      this.sendResp(res, '', { redirect_url: data });
    } catch (error) {
      next(error);
    }
  };

  debit = async (
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
    } catch (error) {
      next(error);
    }
  };

  stimulateNotification = async (
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
    } catch (error) {
      next(error);
    }
  };
}

export default new PaymentCtroller();

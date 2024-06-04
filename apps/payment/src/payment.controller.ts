import { Controller, IGetUserAuthInfoRequest } from '@apps/core';
import { NextFunction, RequestHandler, Response } from 'express';
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
      if (error) return next(new AppError(error.details[0].message, 422));

      const { id } = req.user;
      req.body.userId = +id;
      const data = await paymentService.credit(req.body);
      if (data instanceof Error) return next(data);

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
      const { error } = amountValidation(req.body);
      if (error) return next(new AppError(error.details[0].message, 422));

      const { id } = req.user;
      req.body.userId = +id;
      const data = await paymentService.debit(req.body);
      if (data instanceof Error) return next(data);

      this.sendResp(res, '', { data });
    } catch (error) {
      next(error);
    }
  };

  webhook: RequestHandler = async (req, res, next) => {
    try {
      await paymentService.webhook(req.body);
      this.sendResp(res, '', {});
    } catch (error) {
      next(error);
    }
  };

  verify: RequestHandler = async (req, res, next) => {
    try {
      const { ref } = req.params;
      const data = await paymentService.verify(ref);
      this.sendResp(res, '', data);
    } catch (error) {
      next(error);
    }
  };
}

export default new PaymentCtroller();

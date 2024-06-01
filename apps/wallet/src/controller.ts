import { Controller } from '@apps/core';
import { RequestHandler } from 'express';

class WalletController extends Controller {
  newwallet: RequestHandler = async (req, res, next) => {
    try {
        
    } catch (error) {
      next(error);
    }
  };
}

export default WalletController;

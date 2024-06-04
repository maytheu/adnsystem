import { RequestHandler } from 'express';
import { AppError } from '@apps/error';
import jwt from 'jsonwebtoken';
import { env } from '@apps/core';

export async function isAuthenticated(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return next(new AppError('Please login to access this resource', 401));

    const token = authHeader.split(' ')[1];
    if (!token)
      return next(new AppError('Please login to access this resource', 401));

    const verify = jwt.verify(token, env.SECRET_KEY);
    req.user = verify;
    next();
  } catch (error) {
    next(error);
  }
}

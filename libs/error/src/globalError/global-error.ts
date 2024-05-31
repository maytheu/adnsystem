import { NextFunction, Request, Response } from 'express';

import { AppError } from '@apps/error';

const handleBadToken = () => {
  return new AppError('Unauthenticated user', 401);
};

const handlePrismaNotFound = () => {
  return new AppError('Data not found', 404);
};

const handlePrismaDup = (err: any) => {
  const key = err.meta.target.split('_').join(' ');
  return new AppError(`Duplicate field - ${key}`, 409);
};

const handlePrismaEntry = (err: any) => {
  const key = 'No data found with such entry';
  return new AppError(err, 404);
};

const handlePrismaSyncError = () => {
  return new AppError('Prisma sync error', 500);
};

const handleErrorDev = (err: AppError, req: Request, res: Response) => {
  if (req.originalUrl.startsWith('/api')) {
    return res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message, stack: err.stack });
  }
};

const handleErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  } else {
    console.error('ERROR 💥', err);
    res
      .status(err.statusCode)
      .json({ status: 'error', message: 'Something went wrong' });
  }
};

export default function globalErrorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;  

  if (process.env.NODE_ENV === 'development') {
    handleErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    if (error.code === 'P2002') error = handlePrismaDup(error);
    if (error.code === 'P2023') error = handlePrismaEntry(error);
    if (error.code === 'P2025') error = handlePrismaNotFound();
    if (error.name === 'JsonWebTokenError') error = handleBadToken();
    if (error.name === 'PrismaClientValidationError')
      error = handlePrismaSyncError();
    handleErrorProd(error, res);
  }
}

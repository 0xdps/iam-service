import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation Error',
      details: error.details
    });
    return;
  }

  if (error.name === 'UnauthorizedError') {
    res.status(401).json({
      error: 'Unauthorized'
    });
    return;
  }

  if (error.name === 'ForbiddenError') {
    res.status(403).json({
      error: 'Forbidden'
    });
    return;
  }

  if (error.name === 'NotFoundError') {
    res.status(404).json({
      error: 'Resource not found'
    });
    return;
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error'
  });
}
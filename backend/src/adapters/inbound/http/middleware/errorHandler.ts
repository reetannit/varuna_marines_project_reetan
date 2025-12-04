// FuelEU Maritime - Error Handler Middleware
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Business logic errors that should return 400 instead of 500
const BUSINESS_ERROR_PATTERNS = [
  'No routes found',
  'Cannot bank',
  'Surplus already banked',
  'No compliance surplus',
  'No banking records',
  'Insufficient banked',
  'already exists',
  'not found'
];

function isBusinessError(message: string): boolean {
  return BUSINESS_ERROR_PATTERNS.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase())
  );
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message);
  
  // Use provided statusCode, or 400 for business errors, or 500 for unknown
  let statusCode = err.statusCode;
  if (!statusCode) {
    statusCode = isBusinessError(err.message) ? 400 : 500;
  }
  
  const message = err.message || 'Internal Server Error';

  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...((!isProduction && err.stack) && { stack: err.stack })
  });
}

// Wrapper for async route handlers
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

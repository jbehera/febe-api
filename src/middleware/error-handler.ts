// import { Request, Response, NextFunction } from 'express';
// import { CustomError } from '../errors/custom-error';

// export const errorHandler = (
//   err: Error,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (err instanceof CustomError) {
//     return res.status(err.statusCode).send({ errors: err.serializeErrors() });
//   }

//   console.error(err);
//   return res.status(500).send({ errors: [{ message: err.message }] });
// };

// middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { logger } from '../utils/logger';
import { getRequestContext } from '../context/request-context';

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const context = getRequestContext();
  const traceId = context?.traceId || 'no-trace-id';

  let statusCode = 500;
  let message = 'Internal Server Error';

  // 1. Determine if this is a known error or an unexpected crash
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    // Hide details of unexpected errors in production to avoid leaking sensitive info
    if (process.env.NODE_ENV === 'production') {
      message = 'Something went wrong. Please try again later.';
    } else {
      message = err.message;
    }
  }

  // 2. Log the error (The logger will automatically attach the traceId!)
  logger.error(err.message, { 
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode // Log the status code for filtering later
  });

  // 3. Send the response to Next.js
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: statusCode,
      traceId, // Useful for the frontend to display: "Error ID: abc-123"
    },
  });
};
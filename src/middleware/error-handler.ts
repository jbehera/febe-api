// middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { ErrorListItem } from 'express-zod-safe';
import { AppError } from '../utils/app-error';
import { logger } from '../utils/logger';
import { getRequestContext } from '../context/request-context';
interface StandardizedError {
  message: string;
  field?: string;
}

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || err.status || 500;
  let normalizedErrors: StandardizedError[] = [];
  const context = getRequestContext();
  const traceId = context?.traceId || 'no-trace-id';

  // --- 1. Handle express-zod-safe Array Format ---
  if (Array.isArray(err) && err.length > 0 && err[0].errors) {
    statusCode = 400;

    err.forEach((group: any) => {
      // Check if group.errors.issues exists (standard ZodError)
      // Otherwise fallback to group.errors if it's somehow a plain array
      const issues = group.errors.issues || (Array.isArray(group.errors) ? group.errors : []);

      issues.forEach((issue: any) => {
        normalizedErrors.push({
          message: issue.message,
          // field path logic: join the path array (e.g., ['username'] -> "username")
          field: issue.path ? issue.path.join('.') : undefined,
        });
      });
    });
  }

  // --- 2. Handle HttpClient / External API Errors ---
  else if (err.data || err.response?.data) {
    const data = err.data || err.response?.data;
    // Handle { Message: { responseMessage: "..." } } OR { responseMessage: "..." }
    const msg =
      data?.Message?.responseMessage || data?.responseMessage || err.message;
    normalizedErrors.push({ message: msg });
  }

  // --- 3. Handle Generic Errors ---
  else {
    normalizedErrors.push({ message: err.message || 'Internal Server Error' });
  }

  // If a 401 comes back with no body, ensure we have a message
  if (statusCode === 401 && normalizedErrors.length === 0) {
    normalizedErrors.push({ message: 'Unauthorized access' });
  }

  logger.error(`[Error] ${req.method} ${req.path}`, {
    statusCode,
    errors: normalizedErrors,
    stack: err.stack,
  });

  return res.status(statusCode).json({ errors: normalizedErrors, traceId });
};

export const validationErrorHandler = (
  errors: ErrorListItem[],
  req: any,
  res: any,
  next?: NextFunction
) => {
  if (next) {
    next(errors);
  } else {
    // If for some reason next isn't there, we manually format
    res.status(400).json({
      errors: errors.flatMap((group) =>
        group.errors.issues.map((e) => ({
          message: e.message,
          field: e.path.join('.'),
        }))
      ),
    });
  }
};

// export const errorMiddleware = (
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const context = getRequestContext();
//   const traceId = context?.traceId || 'no-trace-id';
//   let statusCode = err.statusCode || 500;
//   let normalizedErrors: StandardizedError[] = [];

//   // 1. Handle Zod / express-zod-safe Validation Errors (Array format)
//   if (Array.isArray(err) && err[0]?.errors) {
//     statusCode = 400;
//     err[0].errors.forEach((e: any) => {
//       normalizedErrors.push({
//         message: e.message,
//         field: e.path ? e.path.join('.') : undefined, // Joins nested paths like 'user.email'
//       });
//     });
//   }

//   // 2. Handle External API Errors (Passed through from HttpClient)
//   else if (err.data || err.response?.data) {
//     const data = err.data || err.response?.data;

//     // Format: { Message: { responseMessage: "..." } }
//     if (data?.Message?.responseMessage) {
//       normalizedErrors.push({ message: data.Message.responseMessage });
//     }
//     // Format: { responseMessage: "..." }
//     else if (data?.responseMessage) {
//       normalizedErrors.push({ message: data.responseMessage });
//     }
//   }

//   // 3. Handle AppError or Generic Error
//   if (normalizedErrors.length === 0) {
//     normalizedErrors.push({
//       message: err.message || 'Internal Server Error',
//     });
//   }

//   // 4. Log the error for debugging
//   logger.error(`[Error] ${req.method} ${req.path}`, {
//     statusCode,
//     errors: normalizedErrors,
//     stack: err.stack,
//   });

//   // 5. Send standardized response
//   res.status(statusCode).json({
//     errors: normalizedErrors,
//     traceId
//   });
// };

// export const errorMiddleware1 = (
//   err: Error | AppError,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const context = getRequestContext();
//   const traceId = context?.traceId || 'no-trace-id';

//   let statusCode = 500;
//   let message = 'Internal Server Error';

//   // 1. Determine if this is a known error or an unexpected crash
//   if (err instanceof AppError) {
//     statusCode = err.statusCode;
//     message = err.message;
//   } else {
//     // Hide details of unexpected errors in production to avoid leaking sensitive info
//     if (process.env.NODE_ENV === 'production') {
//       message = 'Something went wrong. Please try again later.';
//     } else {
//       message = err.message;
//     }
//   }

//   // 2. Log the error (The logger will automatically attach the traceId!)
//   logger.error(err.message, {
//     stack: err.stack,
//     path: req.path,
//     method: req.method,
//     statusCode, // Log the status code for filtering later
//   });

//   // 3. Send the response to Next.js
//   res.status(statusCode).json({
//     success: false,
//     error: {
//       message,
//       code: statusCode,
//       traceId, // Useful for the frontend to display: "Error ID: abc-123"
//     },
//   });
// };

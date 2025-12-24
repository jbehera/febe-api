// import { Request, Response, NextFunction } from 'express';
// import validate from 'express-zod-safe';
// import { RequestValidationError } from '../errors';

// export const validateRequest = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const errors = validate(req);

//   if(!errors.isEmpty()) {
//     throw new RequestValidationError(errors.array());
//   }

//   next();
// };

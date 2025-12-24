import express from 'express';
import validate from 'express-zod-safe';
import { activateUserSchema, signInSchema, signUpSchema } from '../schemas';
import { signIn, signUp, activateUser } from '../controllers/auth-controller';

const router = express.Router();

router.post('/signin', validate({ body: signInSchema }), signIn);
router.post('/signup', validate({ body: signUpSchema }), signUp);
router.post(
  '/activate-user',
  validate({ body: activateUserSchema }),
  activateUser
);

export { router as authRoutes };

import express from 'express';
import validate from 'express-zod-safe';
import { SignInRequestSchema, SignUpRequestSchema } from '../schemas';
import { signIn, signUp } from '../controllers/auth-controller';

const router = express.Router();

router.post('/signin', validate({ body: SignInRequestSchema }), signIn);
router.post('/signup', validate({ body: SignUpRequestSchema }), signUp);
// router.post(
//   '/activate-user',
//   validate({ body: activateUserSchema }),
//   activateUser
// );

export { router as authRoutes };

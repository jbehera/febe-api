import express from 'express';
import validate from 'express-zod-safe';
import { ActivationRequestSchema, SignInRequestSchema, SignUpRequestSchema } from '../schemas';
import { signIn, signUp, currentUser, activateUser } from '../controllers/auth-controller';

const router = express.Router();

router.post('/signin', validate({ body: SignInRequestSchema }), signIn);
router.post('/signup', validate({ body: SignUpRequestSchema }), signUp);
router.post('/current-user', currentUser);
router.post('/activate-user', validate({ body: ActivationRequestSchema }), activateUser);

export { router as authRoutes };

import 'express-async-errors';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { setGlobalErrorHandler } from 'express-zod-safe';
import { errorMiddleware, validationErrorHandler } from './middleware';
import { apiRoutes } from './routes';
import { contextMiddleware } from './middleware/request-context';
import { AppError } from './utils/app-error';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const app = express();
app.set('trust proxy', true);

// CORS configuration
const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:4000',
  'http://localhost:3000',
  process.env.FEBE_UI_APP_URL,
  // Allow ngrok URLs dynamically
  /https:\/\/[a-zA-Z0-9\-]+\.ngrok(?:-free)?\.app$/,
].filter(Boolean) as (string | RegExp)[];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

app.use(express.json());
app.use(morgan('dev'));
app.use(contextMiddleware);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    requestInterceptor: (request: any) => {
      request.headers['ngrok-skip-browser-warning'] = 'true';
      return request;
    },
  },
}));

setGlobalErrorHandler(validationErrorHandler);


app.use('/api', apiRoutes);

app.all('*', async (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
app.use(errorMiddleware);

export { app };

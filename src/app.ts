import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import { errorMiddleware } from './middleware';
import { apiRoutes } from './routes';
import { contextMiddleware } from './middleware/request-context';
import { AppError } from './utils/app-error';

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(morgan('dev'));
app.use(contextMiddleware);

app.get('/health-check', (req: Request, res: Response) => {
  res.send('Health Ok!');
});

app.use('/api', apiRoutes);

app.all('*', async (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
app.use(errorMiddleware);

export { app };

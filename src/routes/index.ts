import { Request, Response } from 'express';
import { Router } from 'express';
import { router as userRouter } from './user';

export const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ msg: 'Welcome to api!' });
});

router.use('/user', userRouter);

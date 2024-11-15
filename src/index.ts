import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

import { router } from './routes';

const app = express();
const PORT = 3000;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: [FRONTEND_URL],
  })
);

app.use('/api/v1', router);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

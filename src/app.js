import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import facebookRoutes from './routes/facebook.routes.js';
import broadcastRoutes from './routes/broadcast.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { fail } from './utils/response.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/broadcast', broadcastRoutes);

app.use((req, res) => {
  fail(res, 404, 'Not found');
});

app.use(errorHandler);

export default app;

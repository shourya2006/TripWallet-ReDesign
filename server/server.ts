import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Database from './database/Database';
import AuthController from './controllers/AuthController';
import AuthService from './services/AuthService';

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());


app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const initDB = async () => {
  try {
    const db = Database.getInstance();
    const uri = process.env.MONGO_URI || '';
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    await db.connect(uri);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

const startServer = async () => {
  await initDB();

  // Services
  const authService = new AuthService();

  // Controllers
  const authController = new AuthController(authService);

  // Routes
  app.get('/', (req: Request, res: Response) => {
    res.send('Server is running (TypeScript)');
  });
  app.use('/api/auth', authController.router);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();


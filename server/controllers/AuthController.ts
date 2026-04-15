import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { BaseController } from './BaseController';
import AuthService from '../services/AuthService';

const SECRET_KEY = process.env.JWT_SECRET || '';

class AuthController extends BaseController {
  private authService: AuthService;
  public router: Router;

  constructor(authService: AuthService) {
    super();
    this.authService = authService;
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post('/register', (req, res) => this.register(req, res));
    this.router.post('/login', (req, res) => this.login(req, res));
    this.router.post('/refresh', (req, res) => this.refresh(req, res));
    this.router.post('/change-password', (req, res) => this.changePassword(req, res));
  }

  private async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      if (!(email && password && username)) {
        return this.sendError(res, 'All input is required', 400);
      }
      const result = await this.authService.register(username, email, password);
      return this.sendSuccess(res, result, 'User registered successfully', 201);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!(email && password)) {
        return this.sendError(res, 'All input is required', 400);
      }
      const result = await this.authService.login(email, password);
      return this.sendSuccess(res, result, 'Login successful');
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return this.sendError(res, 'Refresh Token Required', 401);
      }
      const result = this.authService.refreshAccessToken(refreshToken);
      return this.sendSuccess(res, result, 'Token refreshed');
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async changePassword(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return this.sendError(res, 'Access Denied', 401);

      const decoded: any = jwt.verify(token, SECRET_KEY);
      const { currentPassword, newPassword } = req.body;

      await this.authService.changePassword(decoded.user_id, currentPassword, newPassword);
      return this.sendSuccess(res, null, 'Password updated successfully');
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }
}

export default AuthController;

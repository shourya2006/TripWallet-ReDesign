import { Router, Request, Response } from 'express';
import { BaseController } from './BaseController';
import UserService from '../services/UserService';
import AuthMiddleware from '../middleware/AuthMiddleware';

class UserController extends BaseController {
  private userService: UserService;
  public router: Router;

  constructor(userService: UserService) {
    super();
    this.userService = userService;
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get('/balance', AuthMiddleware.verifyToken, (req: Request, res: Response) => this.getBalance(req, res));
    this.router.get('/search', AuthMiddleware.verifyToken, (req: Request, res: Response) => this.searchUsers(req, res));
  }

  private async getBalance(req: Request, res: Response) {
    try {
      const result = await this.userService.getBalance(req.user!.user_id);
      return this.sendSuccess(res, result);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async searchUsers(req: Request, res: Response) {
    try {
      const query = req.query.query as string;
      const result = await this.userService.searchUsers(query, req.user!.user_id);
      return this.sendSuccess(res, result);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }
}

export default UserController;

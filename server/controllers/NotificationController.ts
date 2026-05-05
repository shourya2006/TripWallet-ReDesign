import { Router, Request, Response } from 'express';
import { BaseController } from './BaseController';
import NotificationService from '../services/NotificationService';
import AuthMiddleware from '../middleware/AuthMiddleware';

class NotificationController extends BaseController {
  private notificationService: NotificationService;
  public router: Router;

  constructor(notificationService: NotificationService) {
    super();
    this.notificationService = notificationService;
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get('/', AuthMiddleware.verifyToken, (req: Request, res: Response) => this.getNotifications(req, res));
    this.router.post('/:id/accept', AuthMiddleware.verifyToken, (req: Request, res: Response) => this.acceptInvite(req, res));
    this.router.post('/:id/reject', AuthMiddleware.verifyToken, (req: Request, res: Response) => this.rejectInvite(req, res));
  }

  private async getNotifications(req: Request, res: Response) {
    try {
      const result = await this.notificationService.getNotifications(req.user!.user_id);
      return this.sendSuccess(res, result);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async acceptInvite(req: Request, res: Response) {
    try {
      const result = await this.notificationService.acceptInvite(req.params.id as string, req.user!.user_id);
      return this.sendSuccess(res, result);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async rejectInvite(req: Request, res: Response) {
    try {
      const result = await this.notificationService.rejectInvite(req.params.id as string, req.user!.user_id);
      return this.sendSuccess(res, result);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }
}

export default NotificationController;
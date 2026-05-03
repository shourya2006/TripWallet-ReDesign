import { Router, Request, Response } from 'express';
import { BaseController } from './BaseController';
import ExpenseService from '../services/ExpenseService';
import AuthMiddleware from '../middleware/AuthMiddleware';

class ExpenseController extends BaseController {
  private expenseService: ExpenseService;
  public router: Router;

  constructor(expenseService: ExpenseService) {
    super();
    this.expenseService = expenseService;
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get('/:tripId', AuthMiddleware.verifyToken, (req: Request, res: Response) => this.getExpensesByTrip(req, res));
    this.router.post('/', AuthMiddleware.verifyToken, (req: Request, res: Response) => this.addExpense(req, res));
    this.router.delete('/:id', AuthMiddleware.verifyToken, (req: Request, res: Response) => this.deleteExpense(req, res));
  }

  private async getExpensesByTrip(req: Request, res: Response) {
    try {
      const result = await this.expenseService.getExpensesByTrip(req.params.tripId as string);
      return this.sendSuccess(res, result);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async addExpense(req: Request, res: Response) {
    try {
      const result = await this.expenseService.addExpense(req.body, req.user!.user_id);
      return this.sendSuccess(res, result, 'Expense added', 201);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async deleteExpense(req: Request, res: Response) {
    try {
      const result = await this.expenseService.deleteExpense(req.params.id as string, req.user!.user_id);
      return this.sendSuccess(res, result, 'Expense removed');
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }
}

export default ExpenseController;

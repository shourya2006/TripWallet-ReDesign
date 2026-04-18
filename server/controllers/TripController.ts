import { Router, Request, Response } from 'express';
import { BaseController } from './BaseController';
import TripService from '../services/TripService';

const auth = require('../middleware/auth');

class TripController extends BaseController {
  private tripService: TripService;
  public router: Router;

  constructor(tripService: TripService) {
    super();
    this.tripService = tripService;
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get('/', auth, (req: Request, res: Response) => this.getTrips(req, res));
    this.router.get('/:id', auth, (req: Request, res: Response) => this.getTripById(req, res));
    this.router.post('/', auth, (req: Request, res: Response) => this.createTrip(req, res));
    this.router.put('/:id', auth, (req: Request, res: Response) => this.updateTrip(req, res));
    this.router.delete('/:id', auth, (req: Request, res: Response) => this.deleteTrip(req, res));
    this.router.post('/:id/leave', auth, (req: Request, res: Response) => this.leaveTrip(req, res));
    this.router.post('/:id/participants', auth, (req: Request, res: Response) => this.addParticipant(req, res));
  }

  private async getTrips(req: Request, res: Response) {
    try {
      const result = await this.tripService.getTrips((req as any).user.user_id, req.query);
      return this.sendSuccess(res, result);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async getTripById(req: Request, res: Response) {
    try {
      const trip = await this.tripService.getTripById(req.params.id as string, (req as any).user.user_id);
      return this.sendSuccess(res, trip);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async createTrip(req: Request, res: Response) {
    try {
      const trip = await this.tripService.createTrip(req.body, (req as any).user.user_id);
      return this.sendSuccess(res, trip, 'Trip created successfully', 201);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async updateTrip(req: Request, res: Response) {
    try {
      const trip = await this.tripService.updateTrip(req.params.id as string, req.body, (req as any).user.user_id);
      return this.sendSuccess(res, trip, 'Trip updated');
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async deleteTrip(req: Request, res: Response) {
    try {
      const result = await this.tripService.deleteTrip(req.params.id as string, (req as any).user.user_id);
      return this.sendSuccess(res, result);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async leaveTrip(req: Request, res: Response) {
    try {
      const result = await this.tripService.leaveTrip(req.params.id as string, (req as any).user.user_id);
      return this.sendSuccess(res, result);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }

  private async addParticipant(req: Request, res: Response) {
    try {
      const result = await this.tripService.addParticipant(req.params.id as string, req.body.userId, (req as any).user.user_id);
      return this.sendSuccess(res, result);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Server Error', err.status || 500);
    }
  }
}

export default TripController;

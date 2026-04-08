import { Request, Response, NextFunction } from 'express';

// Base controller to handle standard responses and errors
export abstract class BaseController {
  protected sendSuccess(res: Response, data: any = null, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  protected sendError(res: Response, message: string, statusCode: number = 500, errorDetails: any = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: errorDetails
    });
  }
}

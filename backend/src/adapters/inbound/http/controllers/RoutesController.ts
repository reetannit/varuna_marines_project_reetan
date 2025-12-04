// FuelEU Maritime - Routes Controller
import { Request, Response, NextFunction } from 'express';
import { GetRoutesUseCase } from '../../../../core/application/use-cases/GetRoutesUseCase';
import { SetBaselineUseCase } from '../../../../core/application/use-cases/SetBaselineUseCase';
import { GetComparisonUseCase } from '../../../../core/application/use-cases/GetComparisonUseCase';
import { RouteFilters } from '../../../../core/ports/inbound';
import { isValidVesselType, isValidFuelType, VesselType, FuelType } from '../../../../core/domain/entities/index';

export class RoutesController {
  constructor(
    private readonly getRoutesUseCase: GetRoutesUseCase,
    private readonly setBaselineUseCase: SetBaselineUseCase,
    private readonly getComparisonUseCase: GetComparisonUseCase
  ) {}

  /**
   * GET /routes
   * Get all routes with optional filters
   */
  getRoutes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: RouteFilters = {};

      // Parse query parameters
      if (req.query.vesselType) {
        const vt = req.query.vesselType as string;
        if (isValidVesselType(vt)) {
          filters.vesselType = vt as VesselType;
        } else {
          res.status(400).json({ error: `Invalid vessel type: ${vt}` });
          return;
        }
      }

      if (req.query.fuelType) {
        const ft = req.query.fuelType as string;
        if (isValidFuelType(ft)) {
          filters.fuelType = ft as FuelType;
        } else {
          res.status(400).json({ error: `Invalid fuel type: ${ft}` });
          return;
        }
      }

      if (req.query.year) {
        const year = parseInt(req.query.year as string, 10);
        if (isNaN(year)) {
          res.status(400).json({ error: 'Invalid year format' });
          return;
        }
        filters.year = year;
      }

      const routes = await this.getRoutesUseCase.execute(filters);
      res.json({ success: true, data: routes, count: routes.length });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /routes/:id/baseline
   * Set a route as baseline for comparison
   */
  setBaseline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const routeId = req.params.id;

      if (!routeId) {
        res.status(400).json({ error: 'Route ID is required' });
        return;
      }

      const route = await this.setBaselineUseCase.execute(routeId);
      res.json({ 
        success: true, 
        message: `Route ${routeId} set as baseline`,
        data: route 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /routes/comparison
   * Get comparison between baseline and other routes
   */
  getComparison = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comparison = await this.getComparisonUseCase.execute();
      res.json({ success: true, data: comparison });
    } catch (error) {
      next(error);
    }
  };
}

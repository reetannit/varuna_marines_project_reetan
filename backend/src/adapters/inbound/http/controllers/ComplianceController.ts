// FuelEU Maritime - Compliance Controller
import { Request, Response, NextFunction } from 'express';
import { GetComplianceBalanceUseCase } from '../../../../core/application/use-cases/GetComplianceBalanceUseCase';
import { GetAdjustedComplianceBalanceUseCase } from '../../../../core/application/use-cases/GetAdjustedComplianceBalanceUseCase';

export class ComplianceController {
  constructor(
    private readonly getComplianceBalanceUseCase: GetComplianceBalanceUseCase,
    private readonly getAdjustedComplianceBalanceUseCase: GetAdjustedComplianceBalanceUseCase
  ) {}

  /**
   * GET /compliance/cb?shipId&year
   * Compute and return compliance balance for a ship
   */
  getComplianceBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const shipId = req.query.shipId as string;
      const year = parseInt(req.query.year as string, 10);

      if (!shipId) {
        res.status(400).json({ error: 'shipId is required' });
        return;
      }

      if (isNaN(year)) {
        res.status(400).json({ error: 'Valid year is required' });
        return;
      }

      const result = await this.getComplianceBalanceUseCase.execute(shipId, year);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /compliance/adjusted-cb?shipId&year
   * Get adjusted compliance balance (after banking applications)
   */
  getAdjustedComplianceBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const shipId = req.query.shipId as string;
      const year = parseInt(req.query.year as string, 10);

      if (!shipId) {
        res.status(400).json({ error: 'shipId is required' });
        return;
      }

      if (isNaN(year)) {
        res.status(400).json({ error: 'Valid year is required' });
        return;
      }

      const result = await this.getAdjustedComplianceBalanceUseCase.execute(shipId, year);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

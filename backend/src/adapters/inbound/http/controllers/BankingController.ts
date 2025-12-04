// FuelEU Maritime - Banking Controller (Article 20)
import { Request, Response, NextFunction } from 'express';
import { BankSurplusUseCase } from '../../../../core/application/use-cases/BankSurplusUseCase';
import { ApplyBankedUseCase } from '../../../../core/application/use-cases/ApplyBankedUseCase';
import { GetBankingRecordsUseCase } from '../../../../core/application/use-cases/GetBankingRecordsUseCase';

export class BankingController {
  constructor(
    private readonly bankSurplusUseCase: BankSurplusUseCase,
    private readonly applyBankedUseCase: ApplyBankedUseCase,
    private readonly getBankingRecordsUseCase: GetBankingRecordsUseCase
  ) {}

  /**
   * GET /banking/records?shipId&year
   * Get banking records for a ship
   */
  getRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const records = await this.getBankingRecordsUseCase.execute(shipId, year);
      res.json({ success: true, data: records, count: records.length });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /banking/bank
   * Bank positive compliance surplus
   */
  bankSurplus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId, year } = req.body;

      if (!shipId) {
        res.status(400).json({ error: 'shipId is required' });
        return;
      }

      if (!year || isNaN(parseInt(year, 10))) {
        res.status(400).json({ error: 'Valid year is required' });
        return;
      }

      const result = await this.bankSurplusUseCase.execute(shipId, parseInt(year, 10));
      res.json({ 
        success: true, 
        message: 'Surplus banked successfully',
        data: result 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /banking/apply
   * Apply banked surplus to a deficit
   */
  applyBanked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId, year, amount } = req.body;

      if (!shipId) {
        res.status(400).json({ error: 'shipId is required' });
        return;
      }

      if (!year || isNaN(parseInt(year, 10))) {
        res.status(400).json({ error: 'Valid year is required' });
        return;
      }

      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        res.status(400).json({ error: 'Valid positive amount is required' });
        return;
      }

      const result = await this.applyBankedUseCase.execute(
        shipId, 
        parseInt(year, 10), 
        parseFloat(amount)
      );
      res.json({ 
        success: true, 
        message: 'Banked surplus applied successfully',
        data: result 
      });
    } catch (error) {
      next(error);
    }
  };
}

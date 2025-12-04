// FuelEU Maritime - Pools Controller (Article 21)
import { Request, Response, NextFunction } from 'express';
import { CreatePoolUseCase } from '../../../../core/application/use-cases/CreatePoolUseCase';

export class PoolsController {
  constructor(
    private readonly createPoolUseCase: CreatePoolUseCase
  ) {}

  /**
   * POST /pools
   * Create a new compliance pool
   * 
   * Request body:
   * {
   *   year: number,
   *   memberShipIds: string[]
   * }
   */
  createPool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { year, memberShipIds } = req.body;

      if (!year || isNaN(parseInt(year, 10))) {
        res.status(400).json({ error: 'Valid year is required' });
        return;
      }

      if (!memberShipIds || !Array.isArray(memberShipIds) || memberShipIds.length < 2) {
        res.status(400).json({ error: 'At least 2 member ship IDs are required' });
        return;
      }

      // Validate all ship IDs are strings
      if (!memberShipIds.every((id: unknown) => typeof id === 'string' && id.trim() !== '')) {
        res.status(400).json({ error: 'All ship IDs must be non-empty strings' });
        return;
      }

      const result = await this.createPoolUseCase.execute(
        parseInt(year, 10),
        memberShipIds
      );

      res.status(201).json({ 
        success: true, 
        message: 'Pool created successfully',
        data: result 
      });
    } catch (error) {
      next(error);
    }
  };
}

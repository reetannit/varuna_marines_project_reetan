// FuelEU Maritime - Use Case: Create Pool (Article 21)
import { 
  ICreatePoolUseCase, 
  PoolCreationResult 
} from '../../ports/inbound';
import { 
  IShipComplianceRepository,
  IPoolRepository 
} from '../../ports/outbound';
import { Pool } from '../../domain/entities/index';

// Simple UUID generator
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class CreatePoolUseCase implements ICreatePoolUseCase {
  constructor(
    private readonly complianceRepository: IShipComplianceRepository,
    private readonly poolRepository: IPoolRepository
  ) {}

  async execute(year: number, memberShipIds: string[]): Promise<PoolCreationResult> {
    if (memberShipIds.length < 2) {
      throw new Error('Pool must have at least 2 members');
    }

    // Check for duplicate ship IDs
    const uniqueIds = new Set(memberShipIds);
    if (uniqueIds.size !== memberShipIds.length) {
      throw new Error('Duplicate ship IDs are not allowed in a pool');
    }

    // Get compliance records for all members
    const memberBalances: Array<{ shipId: string; cbBefore: number }> = [];
    
    for (const shipId of memberShipIds) {
      const compliance = await this.complianceRepository.findByShipAndYear(shipId, year);
      
      if (!compliance) {
        throw new Error(`No compliance record found for ship ${shipId} in year ${year}`);
      }

      // Check if ship is already in a pool
      const existingPool = await this.poolRepository.findByShipAndYear(shipId, year);
      if (existingPool) {
        throw new Error(`Ship ${shipId} is already in a pool for year ${year}`);
      }

      memberBalances.push({
        shipId,
        cbBefore: compliance.complianceBalance
      });
    }

    // Calculate total pool balance
    const totalPoolBalance = memberBalances.reduce((sum, m) => sum + m.cbBefore, 0);

    // Note: Per FuelEU Article 21, pools should aim for non-negative balance
    // but we allow creation for demonstration purposes

    // Calculate pool allocation using greedy algorithm
    const allocatedMembers = Pool.calculatePoolAllocation(memberBalances);

    // Create pool entity
    const poolId = generateId();
    const pool = Pool.create({
      id: poolId,
      year,
      members: allocatedMembers,
      totalPoolBalance,
      createdAt: new Date()
    });

    // Save pool
    await this.poolRepository.save(pool.toJSON());

    // Update compliance records for all members
    for (const member of allocatedMembers) {
      const compliance = await this.complianceRepository.findByShipAndYear(member.shipId, year);
      if (compliance) {
        await this.complianceRepository.update(compliance.id, {
          complianceBalance: member.cbAfter,
          updatedAt: new Date()
        });
      }
    }

    return {
      poolId,
      year,
      members: allocatedMembers.map(m => ({
        shipId: m.shipId,
        cbBefore: Math.round(m.cbBefore),
        cbAfter: Math.round(m.cbAfter)
      })),
      totalPoolBalance: Math.round(totalPoolBalance),
      isValid: pool.isValid()
    };
  }
}

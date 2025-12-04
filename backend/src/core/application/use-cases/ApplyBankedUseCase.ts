// FuelEU Maritime - Use Case: Apply Banked Surplus (Article 20)
import { 
  IApplyBankedUseCase, 
  ApplyBankingResult 
} from '../../ports/inbound';
import { 
  IBankEntryRepository,
  IShipComplianceRepository 
} from '../../ports/outbound';

export class ApplyBankedUseCase implements IApplyBankedUseCase {
  constructor(
    private readonly bankEntryRepository: IBankEntryRepository,
    private readonly complianceRepository: IShipComplianceRepository
  ) {}

  async execute(shipId: string, year: number, amount: number): Promise<ApplyBankingResult> {
    if (amount <= 0) {
      throw new Error('Amount to apply must be positive');
    }

    // Get current compliance record
    const compliance = await this.complianceRepository.findByShipAndYear(shipId, year);
    
    if (!compliance) {
      throw new Error(`No compliance record found for ship ${shipId} in year ${year}`);
    }

    const cbBefore = compliance.complianceBalance;

    // Check if there's a deficit to cover
    if (cbBefore >= 0) {
      throw new Error('No deficit to cover. Compliance balance is already non-negative.');
    }

    // Get available banked entries
    const bankEntries = await this.bankEntryRepository.findAvailableByShip(shipId);
    
    // Calculate total available banked amount
    const totalAvailable = bankEntries.reduce(
      (sum, entry) => sum + (entry.amountGco2eq - entry.appliedAmount), 
      0
    );

    if (amount > totalAvailable) {
      throw new Error(
        `Requested amount (${amount}) exceeds available banked balance (${totalAvailable})`
      );
    }

    // Apply amount from bank entries (FIFO - oldest first)
    let remainingToApply = amount;
    
    for (const entry of bankEntries) {
      if (remainingToApply <= 0) break;
      
      const availableInEntry = entry.amountGco2eq - entry.appliedAmount;
      const toApplyFromEntry = Math.min(availableInEntry, remainingToApply);
      
      if (toApplyFromEntry > 0) {
        await this.bankEntryRepository.update(entry.id, {
          appliedAmount: entry.appliedAmount + toApplyFromEntry,
          updatedAt: new Date()
        });
        remainingToApply -= toApplyFromEntry;
      }
    }

    // Update compliance balance
    const cbAfter = cbBefore + amount;
    await this.complianceRepository.update(compliance.id, {
      complianceBalance: cbAfter,
      updatedAt: new Date()
    });

    return {
      cbBefore: Math.round(cbBefore),
      applied: Math.round(amount),
      cbAfter: Math.round(cbAfter)
    };
  }
}

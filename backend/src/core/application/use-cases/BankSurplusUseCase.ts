// FuelEU Maritime - Use Case: Bank Surplus (Article 20)
import { 
  IBankSurplusUseCase, 
  BankingResult 
} from '../../ports/inbound';
import { 
  IRouteRepository, 
  IShipComplianceRepository,
  IBankEntryRepository 
} from '../../ports/outbound';
import { 
  BankEntry,
  getTargetIntensity,
  ENERGY_CONVERSION_FACTOR 
} from '../../domain/entities/index';

// Simple UUID generator
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class BankSurplusUseCase implements IBankSurplusUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly complianceRepository: IShipComplianceRepository,
    private readonly bankEntryRepository: IBankEntryRepository
  ) {}

  async execute(shipId: string, year: number): Promise<BankingResult> {
    // Check if already banked for this ship/year
    const existingEntries = await this.bankEntryRepository.findByShipAndYear(shipId, year);
    if (existingEntries.length > 0) {
      throw new Error(`Surplus already banked for ${shipId} in year ${year}. Each ship can only bank once per year.`);
    }

    // Calculate current compliance balance for this vessel type
    const routes = await this.routeRepository.findByFilters({ year, vesselType: shipId as any });
    
    if (routes.length === 0) {
      throw new Error(`No routes found for vessel type ${shipId} in year ${year}`);
    }

    // Calculate compliance balance
    let totalEnergy = 0;
    let weightedIntensity = 0;

    for (const route of routes) {
      const energy = route.fuelConsumption * ENERGY_CONVERSION_FACTOR;
      totalEnergy += energy;
      weightedIntensity += route.ghgIntensity * energy;
    }

    const actualGhgIntensity = weightedIntensity / totalEnergy;
    const targetGhgIntensity = getTargetIntensity(year);
    const totalFuelConsumption = routes.reduce((sum, r) => sum + r.fuelConsumption, 0);
    const complianceBalance = (targetGhgIntensity - actualGhgIntensity) * totalFuelConsumption * ENERGY_CONVERSION_FACTOR;

    // Can only bank if there's a surplus (positive CB)
    if (complianceBalance <= 0) {
      throw new Error('Cannot bank: No compliance surplus available. CB must be positive.');
    }

    // Create bank entry
    const bankEntryProps = {
      id: generateId(),
      shipId,
      year,
      amountGco2eq: complianceBalance,
      originalAmount: complianceBalance,
      appliedAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate using domain entity
    const bankEntry = BankEntry.create(bankEntryProps);
    
    // Save to repository
    await this.bankEntryRepository.save(bankEntry.toJSON());

    // Update compliance record
    await this.complianceRepository.upsert({
      id: generateId(),
      shipId,
      year,
      actualGhgIntensity,
      energyUsed: totalEnergy,
      complianceBalance: 0, // After banking, CB becomes 0
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return {
      cbBefore: Math.round(complianceBalance),
      bankedAmount: Math.round(complianceBalance),
      cbAfter: 0,
      bankEntryId: bankEntry.id
    };
  }
}

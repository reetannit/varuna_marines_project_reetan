// FuelEU Maritime - Use Case: Compute Compliance Balance
import { 
  IGetComplianceBalanceUseCase, 
  ComplianceBalanceResult 
} from '../../ports/inbound';
import { 
  IRouteRepository, 
  IShipComplianceRepository 
} from '../../ports/outbound';
import { 
  ShipCompliance, 
  getTargetIntensity,
  ENERGY_CONVERSION_FACTOR 
} from '../../domain/entities/index';

// Simple UUID generator for IDs
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class GetComplianceBalanceUseCase implements IGetComplianceBalanceUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly complianceRepository: IShipComplianceRepository
  ) {}

  async execute(shipId: string, year: number): Promise<ComplianceBalanceResult> {
    // Get all routes for this ship/year to calculate actual GHG intensity
    const routes = await this.routeRepository.findByFilters({ year });
    
    if (routes.length === 0) {
      throw new Error(`No routes found for year ${year}`);
    }

    // Calculate weighted average GHG intensity
    let totalEnergy = 0;
    let weightedIntensity = 0;

    for (const route of routes) {
      const energy = route.fuelConsumption * ENERGY_CONVERSION_FACTOR;
      totalEnergy += energy;
      weightedIntensity += route.ghgIntensity * energy;
    }

    const actualGhgIntensity = weightedIntensity / totalEnergy;
    const targetGhgIntensity = getTargetIntensity(year);

    // Calculate compliance balance using FuelEU formula
    // CB = (Target - Actual) × Energy in scope
    const complianceBalance = ShipCompliance.calculateComplianceBalance(
      actualGhgIntensity,
      routes.reduce((sum, r) => sum + r.fuelConsumption, 0),
      year
    );

    const isCompliant = complianceBalance >= 0;

    // Save/update compliance record
    const complianceRecord = {
      id: generateId(),
      shipId,
      year,
      actualGhgIntensity,
      energyUsed: totalEnergy,
      complianceBalance,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.complianceRepository.upsert(complianceRecord);

    return {
      shipId,
      year,
      actualGhgIntensity: Math.round(actualGhgIntensity * 100) / 100,
      targetGhgIntensity,
      energyUsed: totalEnergy,
      complianceBalance: Math.round(complianceBalance),
      isCompliant
    };
  }
}

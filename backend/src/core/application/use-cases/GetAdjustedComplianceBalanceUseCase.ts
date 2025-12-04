// FuelEU Maritime - Use Case: Get Adjusted Compliance Balance
import { 
  IGetAdjustedComplianceBalanceUseCase, 
  AdjustedComplianceBalanceResult 
} from '../../ports/inbound';
import { 
  IRouteRepository, 
  IShipComplianceRepository,
  IBankEntryRepository 
} from '../../ports/outbound';
import { 
  getTargetIntensity,
  ENERGY_CONVERSION_FACTOR 
} from '../../domain/entities/index';

export class GetAdjustedComplianceBalanceUseCase implements IGetAdjustedComplianceBalanceUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly complianceRepository: IShipComplianceRepository,
    private readonly bankEntryRepository: IBankEntryRepository
  ) {}

  async execute(shipId: string, year: number): Promise<AdjustedComplianceBalanceResult> {
    // First get or compute the base compliance balance
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
    const totalFuelConsumption = routes.reduce((sum, r) => sum + r.fuelConsumption, 0);
    const complianceBalance = (targetGhgIntensity - actualGhgIntensity) * totalFuelConsumption * ENERGY_CONVERSION_FACTOR;

    // Get banked amounts that have been applied
    const totalApplied = await this.bankEntryRepository.getTotalAppliedByShip(shipId);
    
    // Adjusted balance = original balance + applied banking
    const adjustedBalance = complianceBalance + totalApplied;

    return {
      shipId,
      year,
      actualGhgIntensity: Math.round(actualGhgIntensity * 100) / 100,
      targetGhgIntensity,
      energyUsed: totalEnergy,
      complianceBalance: Math.round(complianceBalance),
      isCompliant: adjustedBalance >= 0,
      bankedApplied: totalApplied,
      adjustedBalance: Math.round(adjustedBalance)
    };
  }
}

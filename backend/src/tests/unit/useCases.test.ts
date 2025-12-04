// FuelEU Maritime - Unit Tests: Use Cases

import { GetComparisonUseCase } from '../../core/application/use-cases/GetComparisonUseCase';
import { GetComplianceBalanceUseCase } from '../../core/application/use-cases/GetComplianceBalanceUseCase';
import { BankSurplusUseCase } from '../../core/application/use-cases/BankSurplusUseCase';
import { CreatePoolUseCase } from '../../core/application/use-cases/CreatePoolUseCase';
import { IRouteRepository, IShipComplianceRepository, IBankEntryRepository, IPoolRepository } from '../../core/ports/outbound';
import { RouteProps } from '../../core/domain/entities';

// Mock repositories
const mockRouteRepository: jest.Mocked<IRouteRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByRouteId: jest.fn(),
  findByFilters: jest.fn(),
  findBaseline: jest.fn(),
  setBaseline: jest.fn(),
  clearBaseline: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockComplianceRepository: jest.Mocked<IShipComplianceRepository> = {
  findByShipAndYear: jest.fn(),
  findByYear: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  upsert: jest.fn(),
};

const mockBankEntryRepository: jest.Mocked<IBankEntryRepository> = {
  findByShipAndYear: jest.fn(),
  findById: jest.fn(),
  findAvailableByShip: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  getTotalBankedByShip: jest.fn(),
  getTotalAppliedByShip: jest.fn(),
};

const mockPoolRepository: jest.Mocked<IPoolRepository> = {
  findById: jest.fn(),
  findByYear: jest.fn(),
  findByShipAndYear: jest.fn(),
  save: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GetComparisonUseCase', () => {
  const useCase = new GetComparisonUseCase(mockRouteRepository);

  const baselineRoute: RouteProps = {
    id: '1',
    routeId: 'R001',
    vesselType: 'Container',
    fuelType: 'HFO',
    year: 2025,
    ghgIntensity: 91.0,
    fuelConsumption: 5000,
    distance: 12000,
    totalEmissions: 4500,
    isBaseline: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const comparisonRoute: RouteProps = {
    ...baselineRoute,
    id: '2',
    routeId: 'R002',
    ghgIntensity: 88.0,
    fuelType: 'LNG',
    isBaseline: false
  };

  it('should throw error when no baseline is set', async () => {
    mockRouteRepository.findBaseline.mockResolvedValue(null);
    
    await expect(useCase.execute()).rejects.toThrow('No baseline route set');
  });

  it('should calculate correct comparison results', async () => {
    mockRouteRepository.findBaseline.mockResolvedValue(baselineRoute);
    mockRouteRepository.findAll.mockResolvedValue([baselineRoute, comparisonRoute]);

    const result = await useCase.execute();

    expect(result.baselineRoute.routeId).toBe('R001');
    expect(result.comparisonRoutes).toHaveLength(1);
    expect(result.targetIntensity).toBe(89.3368);
    
    // Check percent diff calculation
    const comparison = result.comparisonRoutes[0];
    const expectedDiff = ((88.0 / 91.0) - 1) * 100;
    expect(comparison.percentDiff).toBeCloseTo(expectedDiff, 1);
    expect(comparison.compliant).toBe(true); // 88.0 < 89.3368
  });
});

describe('GetComplianceBalanceUseCase', () => {
  const useCase = new GetComplianceBalanceUseCase(
    mockRouteRepository,
    mockComplianceRepository
  );

  it('should throw error when no routes found', async () => {
    mockRouteRepository.findByFilters.mockResolvedValue([]);
    
    await expect(useCase.execute('SHIP001', 2025)).rejects.toThrow('No routes found');
  });

  it('should calculate compliance balance correctly', async () => {
    const routes: RouteProps[] = [{
      id: '1',
      routeId: 'R001',
      vesselType: 'Container',
      fuelType: 'LNG',
      year: 2025,
      ghgIntensity: 88.0, // Below target 89.3368
      fuelConsumption: 5000,
      distance: 12000,
      totalEmissions: 4500,
      isBaseline: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }];

    mockRouteRepository.findByFilters.mockResolvedValue(routes);
    mockComplianceRepository.upsert.mockResolvedValue({
      id: '1',
      shipId: 'SHIP001',
      year: 2025,
      actualGhgIntensity: 88.0,
      energyUsed: 205000000,
      complianceBalance: 27423600,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const result = await useCase.execute('SHIP001', 2025);

    expect(result.shipId).toBe('SHIP001');
    expect(result.year).toBe(2025);
    expect(result.actualGhgIntensity).toBe(88.0);
    expect(result.targetGhgIntensity).toBe(89.3368);
    expect(result.isCompliant).toBe(true);
    expect(result.complianceBalance).toBeGreaterThan(0);
  });
});

describe('BankSurplusUseCase', () => {
  const useCase = new BankSurplusUseCase(
    mockRouteRepository,
    mockComplianceRepository,
    mockBankEntryRepository
  );

  it('should throw error when no surplus to bank', async () => {
    // Route with intensity above target (deficit)
    mockRouteRepository.findByFilters.mockResolvedValue([{
      id: '1',
      routeId: 'R001',
      vesselType: 'Tanker',
      fuelType: 'HFO',
      year: 2025,
      ghgIntensity: 93.5, // Above 89.3368 target
      fuelConsumption: 5000,
      distance: 12000,
      totalEmissions: 4700,
      isBaseline: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await expect(useCase.execute('SHIP001', 2025)).rejects.toThrow('Cannot bank');
  });

  it('should bank positive surplus successfully', async () => {
    mockRouteRepository.findByFilters.mockResolvedValue([{
      id: '1',
      routeId: 'R001',
      vesselType: 'BulkCarrier',
      fuelType: 'LNG',
      year: 2025,
      ghgIntensity: 88.0, // Below target
      fuelConsumption: 5000,
      distance: 12000,
      totalEmissions: 4200,
      isBaseline: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    mockBankEntryRepository.save.mockImplementation(async (entry) => entry);
    mockComplianceRepository.upsert.mockImplementation(async (c) => c);

    const result = await useCase.execute('SHIP001', 2025);

    expect(result.cbBefore).toBeGreaterThan(0);
    expect(result.bankedAmount).toBeGreaterThan(0);
    expect(result.cbAfter).toBe(0);
    expect(mockBankEntryRepository.save).toHaveBeenCalled();
  });
});

describe('CreatePoolUseCase', () => {
  const useCase = new CreatePoolUseCase(
    mockComplianceRepository,
    mockPoolRepository
  );

  it('should throw error for less than 2 members', async () => {
    await expect(useCase.execute(2025, ['SHIP001'])).rejects.toThrow('at least 2 members');
  });

  it('should throw error for negative total pool balance', async () => {
    // Both ships with deficit
    mockComplianceRepository.findByShipAndYear.mockImplementation(async (shipId) => ({
      id: shipId,
      shipId,
      year: 2025,
      actualGhgIntensity: 92.0,
      energyUsed: 205000000,
      complianceBalance: -1000000, // Deficit
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    mockPoolRepository.findByShipAndYear.mockResolvedValue(null);

    await expect(useCase.execute(2025, ['SHIP001', 'SHIP002']))
      .rejects.toThrow('non-negative');
  });

  it('should create pool with valid members', async () => {
    // Ship 1 has surplus, Ship 2 has smaller deficit
    mockComplianceRepository.findByShipAndYear.mockImplementation(async (shipId) => {
      const balance = shipId === 'SHIP001' ? 1000000 : -500000;
      return {
        id: shipId,
        shipId,
        year: 2025,
        actualGhgIntensity: balance > 0 ? 88.0 : 92.0,
        energyUsed: 205000000,
        complianceBalance: balance,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    mockPoolRepository.findByShipAndYear.mockResolvedValue(null);
    mockPoolRepository.save.mockImplementation(async (pool) => pool);
    mockComplianceRepository.update.mockImplementation(async (_, data) => ({
      id: '1',
      shipId: 'SHIP001',
      year: 2025,
      actualGhgIntensity: 88.0,
      energyUsed: 205000000,
      complianceBalance: data.complianceBalance || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const result = await useCase.execute(2025, ['SHIP001', 'SHIP002']);

    expect(result.poolId).toBeDefined();
    expect(result.year).toBe(2025);
    expect(result.members).toHaveLength(2);
    expect(result.totalPoolBalance).toBe(500000);
    expect(result.isValid).toBe(true);
  });
});

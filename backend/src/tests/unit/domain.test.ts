// FuelEU Maritime - Unit Tests: Domain Entities

import { 
  Route, 
  ShipCompliance, 
  BankEntry, 
  Pool, 
  getTargetIntensity,
  ENERGY_CONVERSION_FACTOR 
} from '../../core/domain/entities';

describe('Route Entity', () => {
  const validRouteProps = {
    id: '1',
    routeId: 'R001',
    vesselType: 'Container' as const,
    fuelType: 'HFO' as const,
    year: 2025,
    ghgIntensity: 91.0,
    fuelConsumption: 5000,
    distance: 12000,
    totalEmissions: 4500,
    isBaseline: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('create', () => {
    it('should create a valid route', () => {
      const route = Route.create(validRouteProps);
      expect(route.routeId).toBe('R001');
      expect(route.vesselType).toBe('Container');
      expect(route.ghgIntensity).toBe(91.0);
    });

    it('should throw error for negative GHG intensity', () => {
      expect(() => Route.create({
        ...validRouteProps,
        ghgIntensity: -10
      })).toThrow('GHG Intensity cannot be negative');
    });

    it('should throw error for invalid year', () => {
      expect(() => Route.create({
        ...validRouteProps,
        year: 2015
      })).toThrow('Year must be between 2020 and 2100');
    });
  });

  describe('calculateEnergyInScope', () => {
    it('should calculate energy correctly', () => {
      const route = Route.create(validRouteProps);
      const energy = route.calculateEnergyInScope();
      expect(energy).toBe(5000 * ENERGY_CONVERSION_FACTOR);
    });
  });

  describe('setAsBaseline', () => {
    it('should set route as baseline', () => {
      const route = Route.create(validRouteProps);
      const baselineRoute = route.setAsBaseline();
      expect(baselineRoute.isBaseline).toBe(true);
    });
  });
});

describe('ShipCompliance Entity', () => {
  describe('calculateComplianceBalance', () => {
    it('should calculate positive balance (surplus) when below target', () => {
      // Target for 2025 is 89.3368 gCO₂e/MJ
      const actualIntensity = 88.0; // Below target
      const fuelConsumption = 5000; // tonnes
      const year = 2025;

      const cb = ShipCompliance.calculateComplianceBalance(
        actualIntensity, 
        fuelConsumption, 
        year
      );

      // CB = (89.3368 - 88.0) * 5000 * 41000
      const expected = (89.3368 - 88.0) * 5000 * 41000;
      expect(cb).toBeCloseTo(expected, 0);
      expect(cb).toBeGreaterThan(0);
    });

    it('should calculate negative balance (deficit) when above target', () => {
      const actualIntensity = 91.0; // Above 2025 target of 89.3368
      const fuelConsumption = 5000;
      const year = 2025;

      const cb = ShipCompliance.calculateComplianceBalance(
        actualIntensity, 
        fuelConsumption, 
        year
      );

      expect(cb).toBeLessThan(0);
    });
  });
});

describe('BankEntry Entity', () => {
  const validBankEntryProps = {
    id: '1',
    shipId: 'SHIP001',
    year: 2025,
    amountGco2eq: 1000000,
    originalAmount: 1000000,
    appliedAmount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('create', () => {
    it('should create valid bank entry', () => {
      const entry = BankEntry.create(validBankEntryProps);
      expect(entry.amountGco2eq).toBe(1000000);
      expect(entry.appliedAmount).toBe(0);
    });

    it('should throw error for negative amount', () => {
      expect(() => BankEntry.create({
        ...validBankEntryProps,
        amountGco2eq: -1000
      })).toThrow('Cannot bank a negative amount');
    });
  });

  describe('applyAmount', () => {
    it('should reduce available balance', () => {
      const entry = BankEntry.create(validBankEntryProps);
      const applied = entry.applyAmount(500000);
      expect(applied.getAvailableBalance()).toBe(500000);
    });

    it('should throw error when exceeding available', () => {
      const entry = BankEntry.create(validBankEntryProps);
      expect(() => entry.applyAmount(2000000)).toThrow('Amount exceeds available');
    });
  });
});

describe('Pool Entity', () => {
  describe('calculatePoolAllocation', () => {
    it('should allocate surplus to deficit ships', () => {
      const members = [
        { shipId: 'SHIP001', cbBefore: 1000000 },  // Surplus
        { shipId: 'SHIP002', cbBefore: -500000 }   // Deficit
      ];

      const allocated = Pool.calculatePoolAllocation(members);
      
      // Surplus ship should give to deficit
      const surplusShip = allocated.find(m => m.shipId === 'SHIP001');
      const deficitShip = allocated.find(m => m.shipId === 'SHIP002');

      expect(surplusShip!.cbAfter).toBeLessThan(surplusShip!.cbBefore);
      expect(deficitShip!.cbAfter).toBeGreaterThan(deficitShip!.cbBefore);
    });

    it('should handle full deficit coverage', () => {
      const members = [
        { shipId: 'SHIP001', cbBefore: 1000000 },
        { shipId: 'SHIP002', cbBefore: -400000 }
      ];

      const allocated = Pool.calculatePoolAllocation(members);
      const deficitShip = allocated.find(m => m.shipId === 'SHIP002');

      // Deficit should be fully covered
      expect(deficitShip!.cbAfter).toBe(0);
    });
  });

  describe('create', () => {
    it('should throw error for negative total pool balance', () => {
      expect(() => Pool.create({
        id: '1',
        year: 2025,
        members: [
          { shipId: 'SHIP001', cbBefore: 100, cbAfter: 100 },
          { shipId: 'SHIP002', cbBefore: -500, cbAfter: -400 }
        ],
        totalPoolBalance: -400,
        createdAt: new Date()
      })).toThrow('Total pool compliance balance must be non-negative');
    });
  });
});

describe('Value Objects', () => {
  describe('getTargetIntensity', () => {
    it('should return correct 2025 target (2% reduction)', () => {
      const target = getTargetIntensity(2025);
      expect(target).toBe(89.3368);
    });

    it('should return 2030 target for years 2030-2034', () => {
      const target = getTargetIntensity(2032);
      expect(target).toBe(85.6904);
    });

    it('should return baseline for pre-2025', () => {
      const target = getTargetIntensity(2023);
      expect(target).toBe(91.16);
    });
  });
});

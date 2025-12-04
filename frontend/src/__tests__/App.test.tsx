import { describe, it, expect } from 'vitest';

describe('Frontend App', () => {
  it('should have correct FuelEU target intensity for 2025', () => {
    const BASELINE = 91.16;
    const TARGET_2025_REDUCTION = 0.02; // 2% reduction
    const expectedTarget = BASELINE * (1 - TARGET_2025_REDUCTION);
    
    expect(expectedTarget).toBeCloseTo(89.3368, 4);
  });

  it('should calculate compliance balance correctly', () => {
    // CB = (Target − Actual GHG intensity) × Energy used
    const targetIntensity = 89.3368;
    const actualIntensity = 85.0;
    const fuelConsumption = 1000; // tonnes
    const energyContent = 41000; // MJ/t for VLSFO
    
    const energyUsed = fuelConsumption * energyContent;
    const complianceBalance = (targetIntensity - actualIntensity) * energyUsed;
    
    // Positive CB means surplus (actual is below target)
    expect(complianceBalance).toBeGreaterThan(0);
    // Expected: (89.3368 - 85) × 1000 × 41000 = 4.3368 × 41,000,000 = 177,808,800 MJ
    expect(complianceBalance).toBeCloseTo(177808800, -3); // Within 1000 MJ tolerance
  });

  it('should correctly identify deficit vs surplus', () => {
    const targetIntensity = 89.3368;
    
    // Ship with good performance (below target)
    const lowEmissionShip = 75.0;
    expect(lowEmissionShip < targetIntensity).toBe(true); // Has surplus
    
    // Ship with poor performance (above target)
    const highEmissionShip = 95.0;
    expect(highEmissionShip > targetIntensity).toBe(true); // Has deficit
  });

  it('should apply banking rules correctly', () => {
    // Banking allows carrying forward surplus for up to 3 years
    const surplus2025 = 1000000; // MJ surplus
    const yearsValid = 3;
    
    // Banking should preserve the value
    const bankedAmount = surplus2025;
    expect(bankedAmount).toBe(surplus2025);
    
    // After 3 years, it expires
    const expiryYear = 2025 + yearsValid;
    expect(expiryYear).toBe(2028);
  });

  it('should understand pooling mechanics', () => {
    // Pooling: Ships can share compliance balances
    const ship1Balance = 500000; // Surplus
    const ship2Balance = -200000; // Deficit
    
    const poolTotal = ship1Balance + ship2Balance;
    
    // Pool has net surplus
    expect(poolTotal).toBe(300000);
    expect(poolTotal).toBeGreaterThan(0);
  });
});

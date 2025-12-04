// FuelEU Maritime - Database Seed Data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seed data from the assignment KPIs dataset
const routesSeedData = [
  {
    routeId: 'R001',
    vesselType: 'Container',
    fuelType: 'HFO',
    year: 2024,
    ghgIntensity: 91.0,
    fuelConsumption: 5000,
    distance: 12000,
    totalEmissions: 4500,
    isBaseline: true // Set as initial baseline
  },
  {
    routeId: 'R002',
    vesselType: 'BulkCarrier',
    fuelType: 'LNG',
    year: 2024,
    ghgIntensity: 88.0,
    fuelConsumption: 4800,
    distance: 11500,
    totalEmissions: 4200,
    isBaseline: false
  },
  {
    routeId: 'R003',
    vesselType: 'Tanker',
    fuelType: 'MGO',
    year: 2024,
    ghgIntensity: 93.5,
    fuelConsumption: 5100,
    distance: 12500,
    totalEmissions: 4700,
    isBaseline: false
  },
  {
    routeId: 'R004',
    vesselType: 'RoRo',
    fuelType: 'HFO',
    year: 2025,
    ghgIntensity: 89.2,
    fuelConsumption: 4900,
    distance: 11800,
    totalEmissions: 4300,
    isBaseline: false
  },
  {
    routeId: 'R005',
    vesselType: 'Container',
    fuelType: 'LNG',
    year: 2025,
    ghgIntensity: 90.5,
    fuelConsumption: 4950,
    distance: 11900,
    totalEmissions: 4400,
    isBaseline: false
  }
];

// Initial ship compliance records - using vessel types as shipId for consistency
const shipComplianceSeedData = [
  {
    shipId: 'Container',
    year: 2024,
    actualGhgIntensity: 91.0,
    energyUsed: 205000000, // 5000t * 41000 MJ/t
    complianceBalance: -3485000000 // Deficit (above target)
  },
  {
    shipId: 'BulkCarrier',
    year: 2024,
    actualGhgIntensity: 88.0,
    energyUsed: 196800000, // 4800t * 41000 MJ/t  
    complianceBalance: 262608000 // Surplus (below target 89.3368)
  },
  {
    shipId: 'RoRo',
    year: 2025,
    actualGhgIntensity: 89.2,
    energyUsed: 200900000, // 4900t * 41000 MJ/t
    complianceBalance: 27523120 // Small surplus
  },
  {
    shipId: 'Container',
    year: 2025,
    actualGhgIntensity: 90.5,
    energyUsed: 202950000, // 4950t * 41000 MJ/t
    complianceBalance: -236431800 // Deficit
  }
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.poolMember.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.bankEntry.deleteMany();
  await prisma.shipCompliance.deleteMany();
  await prisma.route.deleteMany();

  // Seed routes
  console.log('Seeding routes...');
  for (const route of routesSeedData) {
    await prisma.route.create({ data: route });
    console.log(`  ✓ Created route ${route.routeId}`);
  }

  // Seed ship compliance records
  console.log('\nSeeding ship compliance records...');
  for (const compliance of shipComplianceSeedData) {
    await prisma.shipCompliance.create({ data: compliance });
    console.log(`  ✓ Created compliance record for ${compliance.shipId}`);
  }

  console.log('\n✅ Database seed completed successfully!\n');
  
  // Print summary
  const routeCount = await prisma.route.count();
  const complianceCount = await prisma.shipCompliance.count();
  console.log('Summary:');
  console.log(`  - Routes: ${routeCount}`);
  console.log(`  - Compliance Records: ${complianceCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

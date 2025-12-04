// FuelEU Maritime - Express Server Entry Point
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

// Repositories
import { 
  PrismaRouteRepository, 
  PrismaShipComplianceRepository,
  PrismaBankEntryRepository,
  PrismaPoolRepository
} from '../../adapters/outbound/postgres';

// Use Cases
import { GetRoutesUseCase } from '../../core/application/use-cases/GetRoutesUseCase';
import { SetBaselineUseCase } from '../../core/application/use-cases/SetBaselineUseCase';
import { GetComparisonUseCase } from '../../core/application/use-cases/GetComparisonUseCase';
import { GetComplianceBalanceUseCase } from '../../core/application/use-cases/GetComplianceBalanceUseCase';
import { GetAdjustedComplianceBalanceUseCase } from '../../core/application/use-cases/GetAdjustedComplianceBalanceUseCase';
import { BankSurplusUseCase } from '../../core/application/use-cases/BankSurplusUseCase';
import { ApplyBankedUseCase } from '../../core/application/use-cases/ApplyBankedUseCase';
import { CreatePoolUseCase } from '../../core/application/use-cases/CreatePoolUseCase';
import { GetBankingRecordsUseCase } from '../../core/application/use-cases/GetBankingRecordsUseCase';

// Controllers
import { 
  RoutesController, 
  ComplianceController, 
  BankingController, 
  PoolsController 
} from '../../adapters/inbound/http/controllers';

// Routes and Middleware
import { createRoutes } from '../../adapters/inbound/http/routes';
import { errorHandler } from '../../adapters/inbound/http/middleware/errorHandler';

const PORT = process.env.PORT || 3001;

async function bootstrap(): Promise<void> {
  // Initialize Prisma Client
  const prisma = new PrismaClient();

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Initialize repositories (Dependency Injection)
    const routeRepository = new PrismaRouteRepository(prisma);
    const complianceRepository = new PrismaShipComplianceRepository(prisma);
    const bankEntryRepository = new PrismaBankEntryRepository(prisma);
    const poolRepository = new PrismaPoolRepository(prisma);

    // Initialize use cases
    const getRoutesUseCase = new GetRoutesUseCase(routeRepository);
    const setBaselineUseCase = new SetBaselineUseCase(routeRepository);
    const getComparisonUseCase = new GetComparisonUseCase(routeRepository);
    const getComplianceBalanceUseCase = new GetComplianceBalanceUseCase(
      routeRepository, 
      complianceRepository
    );
    const getAdjustedComplianceBalanceUseCase = new GetAdjustedComplianceBalanceUseCase(
      routeRepository,
      complianceRepository,
      bankEntryRepository
    );
    const bankSurplusUseCase = new BankSurplusUseCase(
      routeRepository,
      complianceRepository,
      bankEntryRepository
    );
    const applyBankedUseCase = new ApplyBankedUseCase(
      bankEntryRepository,
      complianceRepository
    );
    const createPoolUseCase = new CreatePoolUseCase(
      complianceRepository,
      poolRepository
    );
    const getBankingRecordsUseCase = new GetBankingRecordsUseCase(bankEntryRepository);

    // Initialize controllers
    const routesController = new RoutesController(
      getRoutesUseCase,
      setBaselineUseCase,
      getComparisonUseCase
    );
    const complianceController = new ComplianceController(
      getComplianceBalanceUseCase,
      getAdjustedComplianceBalanceUseCase
    );
    const bankingController = new BankingController(
      bankSurplusUseCase,
      applyBankedUseCase,
      getBankingRecordsUseCase
    );
    const poolsController = new PoolsController(createPoolUseCase);

    // Create Express app
    const app: Application = express();

    // Middleware
    app.use(helmet());
    app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }));
    app.use(morgan('dev'));
    app.use(express.json());

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'FuelEU Maritime API'
      });
    });

    // API Routes
    app.use('/api', createRoutes(
      routesController,
      complianceController,
      bankingController,
      poolsController
    ));

    // Error handling middleware
    app.use(errorHandler);

    // 404 handler
    app.use((_req, res) => {
      res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found' 
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚢 FuelEU Maritime Compliance API                      ║
║                                                          ║
║   Server running on http://localhost:${PORT}                ║
║                                                          ║
║   Endpoints:                                             ║
║   - GET  /api/routes                                     ║
║   - GET  /api/routes/comparison                          ║
║   - POST /api/routes/:id/baseline                        ║
║   - GET  /api/compliance/cb                              ║
║   - GET  /api/compliance/adjusted-cb                     ║
║   - GET  /api/banking/records                            ║
║   - POST /api/banking/bank                               ║
║   - POST /api/banking/apply                              ║
║   - POST /api/pools                                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM, shutting down...');
      await prisma.$disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();

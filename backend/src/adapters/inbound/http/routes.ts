// FuelEU Maritime - Express Routes Setup
import { Router } from 'express';
import { 
  RoutesController, 
  ComplianceController, 
  BankingController, 
  PoolsController 
} from './controllers/index';

export function createRoutes(
  routesController: RoutesController,
  complianceController: ComplianceController,
  bankingController: BankingController,
  poolsController: PoolsController
): Router {
  const router = Router();

  // Routes endpoints
  router.get('/routes', routesController.getRoutes);
  router.get('/routes/comparison', routesController.getComparison);
  router.post('/routes/:id/baseline', routesController.setBaseline);

  // Compliance endpoints
  router.get('/compliance/cb', complianceController.getComplianceBalance);
  router.get('/compliance/adjusted-cb', complianceController.getAdjustedComplianceBalance);

  // Banking endpoints (Article 20)
  router.get('/banking/records', bankingController.getRecords);
  router.post('/banking/bank', bankingController.bankSurplus);
  router.post('/banking/apply', bankingController.applyBanked);

  // Pools endpoints (Article 21)
  router.post('/pools', poolsController.createPool);

  return router;
}

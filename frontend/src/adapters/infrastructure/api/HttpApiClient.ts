import axios, { AxiosInstance } from 'axios';
import { Route, BankEntry, Pool } from '../../../core/domain/entities';
import { RouteComparison } from '../../../core/domain/entities/value-objects';

/**
 * HTTP API Client Adapter
 * Implements API calls matching the actual backend endpoints
 */
export class HttpApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor to extract error messages from backend
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Extract error message from backend response
        const backendMessage = error.response?.data?.error;
        if (backendMessage) {
          return Promise.reject(new Error(backendMessage));
        }
        return Promise.reject(error);
      }
    );
  }

  // Routes - GET /routes
  async getRoutes(): Promise<Route[]> {
    const response = await this.client.get('/routes');
    return response.data.data.map(this.mapRoute);
  }

  // Comparison - GET /routes/comparison
  async getComparison(): Promise<RouteComparison[]> {
    const response = await this.client.get('/routes/comparison');
    const data = response.data.data;
    
    const targetIntensity = data.targetIntensity || 89.3368;
    const comparisons: RouteComparison[] = [];
    
    // Add baseline route
    if (data.baselineRoute) {
      const br = data.baselineRoute;
      const intensity = br.ghgIntensity;
      const diff = targetIntensity - intensity;
      const cb = diff * (br.fuelConsumption * 41000);
      comparisons.push({
        routeId: br.routeId,
        ship: br.vesselType,
        actualGHGIntensity: intensity,
        targetGHGIntensity: targetIntensity,
        difference: diff,
        status: intensity <= targetIntensity ? 'COMPLIANT' : 'NON_COMPLIANT',
        fuelConsumption: br.fuelConsumption,
        complianceBalance: cb,
      });
    }
    
    // Add comparison routes
    if (data.comparisonRoutes) {
      for (const item of data.comparisonRoutes) {
        const r = item.route;
        const intensity = r.ghgIntensity;
        const diff = targetIntensity - intensity;
        const cb = diff * (r.fuelConsumption * 41000);
        comparisons.push({
          routeId: r.routeId,
          ship: r.vesselType,
          actualGHGIntensity: intensity,
          targetGHGIntensity: targetIntensity,
          difference: diff,
          status: item.compliant ? 'COMPLIANT' : 'NON_COMPLIANT',
          fuelConsumption: r.fuelConsumption,
          complianceBalance: cb,
        });
      }
    }
    
    return comparisons;
  }

  // Banking - GET /banking/records?shipId=X&year=Y
  async getBankingRecords(shipId: string, year: number): Promise<BankEntry[]> {
    const response = await this.client.get('/banking/records', { 
      params: { shipId, year } 
    });
    const data = response.data.data || [];
    // Map backend response to BankEntry format
    return data.map((record: Record<string, unknown>) => ({
      id: record.id as string,
      shipId: shipId,
      year: year,
      bankedAmount: record.amount as number,
      usedAmount: record.appliedAmount as number,
      remainingAmount: record.availableBalance as number,
      expiryYear: year + 2,
      status: 'ACTIVE' as const,
      createdAt: new Date(record.createdAt as string),
    }));
  }

  // Banking - POST /banking/bank
  async bankSurplus(shipId: string, year: number): Promise<BankEntry> {
    const response = await this.client.post('/banking/bank', { shipId, year });
    return response.data.data;
  }

  // Banking - POST /banking/apply
  async applyBanked(shipId: string, year: number, amount: number): Promise<unknown> {
    const response = await this.client.post('/banking/apply', { shipId, year, amount });
    return response.data.data;
  }

  // Pools - POST /pools
  async createPool(shipIds: string[], year: number): Promise<Pool> {
    const response = await this.client.post('/pools', { memberShipIds: shipIds, year });
    const data = response.data.data;
    // Map backend response to Pool type
    return {
      id: data.poolId,
      name: `Pool-${year}-${data.poolId.slice(0, 8)}`,
      year: data.year,
      members: data.members.map((m: { shipId: string; cbBefore: number; cbAfter: number }) => ({
        id: m.shipId,
        poolId: data.poolId,
        shipId: m.shipId,
        shipName: m.shipId,
        contribution: m.cbBefore,
        joinedAt: new Date(),
      })),
      totalComplianceBalance: data.totalPoolBalance,
      status: 'ACTIVE' as const,
      createdAt: new Date(),
    };
  }

  // Map backend route to frontend Route type
  private mapRoute(data: Record<string, unknown>): Route {
    return {
      id: data.id as string,
      routeId: data.routeId as string,
      ship: data.vesselType as string,
      departurePort: 'Rotterdam',  // Default since not in DB
      arrivalPort: 'Shanghai',     // Default since not in DB
      distance: data.distance as number,
      fuelConsumption: data.fuelConsumption as number,
      fuelType: data.fuelType as string,
      actualGHGIntensity: data.ghgIntensity as number,
      createdAt: new Date(data.createdAt as string),
    };
  }
}

// Singleton instance
export const apiClient = new HttpApiClient();

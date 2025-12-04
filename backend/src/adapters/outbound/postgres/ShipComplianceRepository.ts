// FuelEU Maritime - Prisma Ship Compliance Repository Implementation
import { PrismaClient } from '@prisma/client';
import { IShipComplianceRepository } from '../../../core/ports/outbound';
import { ShipComplianceProps } from '../../../core/domain/entities/index';

export class PrismaShipComplianceRepository implements IShipComplianceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year: number): Promise<ShipComplianceProps | null> {
    const compliance = await this.prisma.shipCompliance.findUnique({
      where: { shipId_year: { shipId, year } }
    });
    return compliance ? this.toDomain(compliance) : null;
  }

  async findByYear(year: number): Promise<ShipComplianceProps[]> {
    const records = await this.prisma.shipCompliance.findMany({
      where: { year },
      orderBy: { shipId: 'asc' }
    });
    return records.map(this.toDomain);
  }

  async save(compliance: ShipComplianceProps): Promise<ShipComplianceProps> {
    const created = await this.prisma.shipCompliance.create({
      data: {
        id: compliance.id,
        shipId: compliance.shipId,
        year: compliance.year,
        actualGhgIntensity: compliance.actualGhgIntensity,
        energyUsed: compliance.energyUsed,
        complianceBalance: compliance.complianceBalance
      }
    });
    return this.toDomain(created);
  }

  async update(id: string, data: Partial<ShipComplianceProps>): Promise<ShipComplianceProps> {
    const updated = await this.prisma.shipCompliance.update({
      where: { id },
      data: {
        ...(data.actualGhgIntensity && { actualGhgIntensity: data.actualGhgIntensity }),
        ...(data.energyUsed && { energyUsed: data.energyUsed }),
        ...(data.complianceBalance !== undefined && { complianceBalance: data.complianceBalance })
      }
    });
    return this.toDomain(updated);
  }

  async upsert(compliance: ShipComplianceProps): Promise<ShipComplianceProps> {
    const upserted = await this.prisma.shipCompliance.upsert({
      where: { 
        shipId_year: { 
          shipId: compliance.shipId, 
          year: compliance.year 
        } 
      },
      create: {
        id: compliance.id,
        shipId: compliance.shipId,
        year: compliance.year,
        actualGhgIntensity: compliance.actualGhgIntensity,
        energyUsed: compliance.energyUsed,
        complianceBalance: compliance.complianceBalance
      },
      update: {
        actualGhgIntensity: compliance.actualGhgIntensity,
        energyUsed: compliance.energyUsed,
        complianceBalance: compliance.complianceBalance
      }
    });
    return this.toDomain(upserted);
  }

  private toDomain(record: {
    id: string;
    shipId: string;
    year: number;
    actualGhgIntensity: number;
    energyUsed: number;
    complianceBalance: number;
    createdAt: Date;
    updatedAt: Date;
  }): ShipComplianceProps {
    return {
      id: record.id,
      shipId: record.shipId,
      year: record.year,
      actualGhgIntensity: record.actualGhgIntensity,
      energyUsed: record.energyUsed,
      complianceBalance: record.complianceBalance,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }
}

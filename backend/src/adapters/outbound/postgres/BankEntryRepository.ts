// FuelEU Maritime - Prisma Bank Entry Repository Implementation
import { PrismaClient } from '@prisma/client';
import { IBankEntryRepository } from '../../../core/ports/outbound';
import { BankEntryProps } from '../../../core/domain/entities/index';

export class PrismaBankEntryRepository implements IBankEntryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year: number): Promise<BankEntryProps[]> {
    const entries = await this.prisma.bankEntry.findMany({
      where: { shipId, year },
      orderBy: { createdAt: 'asc' }
    });
    return entries.map(this.toDomain);
  }

  async findById(id: string): Promise<BankEntryProps | null> {
    const entry = await this.prisma.bankEntry.findUnique({ where: { id } });
    return entry ? this.toDomain(entry) : null;
  }

  async findAvailableByShip(shipId: string): Promise<BankEntryProps[]> {
    const entries = await this.prisma.bankEntry.findMany({
      where: { shipId },
      orderBy: { createdAt: 'asc' } // FIFO
    });
    
    // Filter to only return entries with available balance
    return entries
      .filter(e => e.amountGco2eq > e.appliedAmount)
      .map(this.toDomain);
  }

  async save(entry: BankEntryProps): Promise<BankEntryProps> {
    const created = await this.prisma.bankEntry.create({
      data: {
        id: entry.id,
        shipId: entry.shipId,
        year: entry.year,
        amountGco2eq: entry.amountGco2eq,
        originalAmount: entry.originalAmount,
        appliedAmount: entry.appliedAmount
      }
    });
    return this.toDomain(created);
  }

  async update(id: string, data: Partial<BankEntryProps>): Promise<BankEntryProps> {
    const updated = await this.prisma.bankEntry.update({
      where: { id },
      data: {
        ...(data.amountGco2eq && { amountGco2eq: data.amountGco2eq }),
        ...(data.appliedAmount !== undefined && { appliedAmount: data.appliedAmount })
      }
    });
    return this.toDomain(updated);
  }

  async getTotalBankedByShip(shipId: string): Promise<number> {
    const result = await this.prisma.bankEntry.aggregate({
      where: { shipId },
      _sum: { amountGco2eq: true }
    });
    return result._sum.amountGco2eq || 0;
  }

  async getTotalAppliedByShip(shipId: string): Promise<number> {
    const result = await this.prisma.bankEntry.aggregate({
      where: { shipId },
      _sum: { appliedAmount: true }
    });
    return result._sum.appliedAmount || 0;
  }

  private toDomain(entry: {
    id: string;
    shipId: string;
    year: number;
    amountGco2eq: number;
    originalAmount: number;
    appliedAmount: number;
    createdAt: Date;
    updatedAt: Date;
  }): BankEntryProps {
    return {
      id: entry.id,
      shipId: entry.shipId,
      year: entry.year,
      amountGco2eq: entry.amountGco2eq,
      originalAmount: entry.originalAmount,
      appliedAmount: entry.appliedAmount,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    };
  }
}

// FuelEU Maritime - Use Case: Get Banking Records
import { IGetBankingRecordsUseCase } from '../../ports/inbound';
import { IBankEntryRepository } from '../../ports/outbound';

export class GetBankingRecordsUseCase implements IGetBankingRecordsUseCase {
  constructor(
    private readonly bankEntryRepository: IBankEntryRepository
  ) {}

  async execute(shipId: string, year: number): Promise<Array<{
    id: string;
    amount: number;
    appliedAmount: number;
    availableBalance: number;
    createdAt: Date;
  }>> {
    const entries = await this.bankEntryRepository.findByShipAndYear(shipId, year);

    return entries.map(entry => ({
      id: entry.id,
      amount: entry.amountGco2eq,
      appliedAmount: entry.appliedAmount,
      availableBalance: entry.amountGco2eq - entry.appliedAmount,
      createdAt: entry.createdAt
    }));
  }
}

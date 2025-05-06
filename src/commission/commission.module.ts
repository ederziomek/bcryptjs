import { Module } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { PrismaModule } from '../prisma/prisma.module'; // Assuming PrismaModule exists
import { WalletModule } from '../wallet/wallet.module'; // Assuming WalletModule exists and exports WalletService

@Module({
  imports: [PrismaModule, WalletModule], // Import necessary modules
  providers: [CommissionService],
  exports: [CommissionService], // Export service if needed by other modules (like IndicationService)
})
export class CommissionModule {}


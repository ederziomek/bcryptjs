import { Module } from '@nestjs/common';
import { IntegrationService } from '../integration.service'; // Assuming service is in root
import { IntegrationController } from '../integration.controller'; // Assuming controller is in root
import { PrismaModule } from '../prisma/prisma.module';
import { AffiliateModule } from '../affiliate/affiliate.module'; // Import AffiliateModule
import { IndicationModule } from '../indication/indication.module'; // Import IndicationModule
import { WalletModule } from '../wallet/wallet.module'; // Import WalletModule
import { NetworkModule } from '../network/network.module'; // Import NetworkModule

@Module({
  imports: [
    PrismaModule,
    AffiliateModule, // Import AffiliateModule to use AffiliateService
    IndicationModule, // Import IndicationModule to use IndicationService
    WalletModule, // Import WalletModule to use WalletService
    NetworkModule, // Import NetworkModule to use NetworkService
  ],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [IntegrationService], // Export if needed by other modules
})
export class IntegrationModule {}


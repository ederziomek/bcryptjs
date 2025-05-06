import { Module } from '@nestjs/common';
import { WalletService } from '../wallet.service'; // Correct path assuming service is in root
import { WalletController } from '../wallet.controller'; // Correct path assuming controller is in root
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Import PrismaModule
  controllers: [WalletController], // Declare controller
  providers: [WalletService], // Provide WalletService
  exports: [WalletService], // Export WalletService so other modules can use it
})
export class WalletModule {}


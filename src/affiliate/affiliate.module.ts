import { Module } from '@nestjs/common';
import { AffiliateService } from '../affiliate.service'; // Assuming service is in root
import { AffiliateController } from '../affiliate.controller'; // Assuming controller is in root
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Import PrismaModule
  controllers: [AffiliateController], // Declare controller
  providers: [AffiliateService], // Provide AffiliateService
  exports: [AffiliateService], // Export AffiliateService
})
export class AffiliateModule {}


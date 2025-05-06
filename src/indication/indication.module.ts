import { Module } from '@nestjs/common';
import { IndicationService } from '../indication.service'; // Assuming service is in root
import { IndicationController } from '../indication.controller'; // Assuming controller is in root
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule
import { BullModule } from '@nestjs/bullmq'; // Import BullModule
import { COMMISSION_QUEUE } from '../jobs/commission.processor'; // Import queue name

@Module({
  imports: [
    PrismaModule, // Import PrismaModule
    BullModule.registerQueue({ // Register the queue used by IndicationService
      name: COMMISSION_QUEUE,
    }),
  ],
  controllers: [IndicationController], // Declare controller
  providers: [IndicationService], // Provide IndicationService
  exports: [IndicationService], // Export IndicationService
})
export class IndicationModule {}


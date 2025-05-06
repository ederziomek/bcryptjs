import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CommissionProcessor, COMMISSION_QUEUE } from './commission.processor';
import { CommissionModule } from '../commission/commission.module'; // Import module providing CommissionService
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [
    BullModule.registerQueue({
      name: COMMISSION_QUEUE,
    }),
    CommissionModule, // Ensure CommissionService is available
    PrismaModule,     // Ensure PrismaService is available
  ],
  providers: [CommissionProcessor],
  exports: [BullModule], // Export BullModule to allow injecting queues elsewhere
})
export class JobsModule {}


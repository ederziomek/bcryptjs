import { Module } from '@nestjs/common';
import { NetworkService } from '../network.service'; // Assuming service is in root
import { NetworkController } from './network.controller'; // Assuming controller is in this folder
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Import PrismaModule
  controllers: [NetworkController], // Declare controller
  providers: [NetworkService], // Provide NetworkService
  exports: [NetworkService], // Export NetworkService
})
export class NetworkModule {}


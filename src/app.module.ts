import { Module, Logger } from '@nestjs/common'; // Added Logger
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service'; // Import PrismaService
import { AffiliateModule } from './affiliate/affiliate.module';
import { AffiliateController } from './affiliate.controller';
import { IndicationModule } from './indication/indication.module';
import { IndicationController } from './indication.controller';
import { WalletModule } from './wallet/wallet.module';
import { WalletController } from './wallet.controller';
import { NetworkModule } from './network/network.module';
import { IntegrationModule } from './integration/integration.module';
import { IntegrationController } from './integration.controller';
// import { AppAdminModule } from './admin.module'; // Removed AppAdminModule import
import { JobsModule } from './jobs/jobs.module';
import { CommissionModule } from './commission/commission.module';

// Define DEFAULT_ADMIN and authenticate function if needed for auth later

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    AffiliateModule,
    IndicationModule,
    WalletModule,
    NetworkModule,
    IntegrationModule,
    CommissionModule,
    JobsModule,
    // AdminJS integration will be handled in main.ts via @adminjs/express
  ],
  controllers: [
    AppController,
    AffiliateController,
    IndicationController,
    WalletController,
    IntegrationController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {}

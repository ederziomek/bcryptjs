import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Note: It's often recommended to connect lazily, but for simplicity
    // in this initial setup, we connect eagerly. Consider adjusting later.
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}


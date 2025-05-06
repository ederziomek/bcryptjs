import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { CommissionService } from '../commission/commission.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { IndicationStatus, CommissionType } from '@prisma/client'; // Removed CommissionStatus import

export const COMMISSION_QUEUE = 'commission-queue';
export const CREATE_CPA_COMMISSION_JOB = 'create-cpa-commission';

interface CreateCpaCommissionJobData {
  indicationId: string;
  qualifiedAt: string; // ISO string timestamp when qualification happened
}

@Processor(COMMISSION_QUEUE)
export class CommissionProcessor extends WorkerHost {
  private readonly logger = new Logger(CommissionProcessor.name);

  constructor(
    private readonly commissionService: CommissionService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<CreateCpaCommissionJobData, any, string>): Promise<any> {
    if (job.name === CREATE_CPA_COMMISSION_JOB) {
      return this.handleCreateCpaCommission(job);
    } else {
      this.logger.warn(`Received job with unknown name: ${job.name}`);
      return {};
    }
  }

  private async handleCreateCpaCommission(job: Job<CreateCpaCommissionJobData>): Promise<void> {
    const { indicationId, qualifiedAt } = job.data;
    this.logger.log(`Processing job ${job.id} (${job.name}): Create CPA commission for indication ${indicationId}`);

    try {
      await this.prisma.$transaction(async (tx) => {
        // Fetch System Settings to get the CPA amount
        const settings = await tx.systemSettings.findFirst();
        if (!settings || !settings.cpaCommissionAmount) {
            this.logger.error(`Job ${job.id}: SystemSettings or cpaCommissionAmount not found.`);
            throw new Error('SystemSettings or cpaCommissionAmount not configured.');
        }
        const commissionAmountDecimal = settings.cpaCommissionAmount;

        const indication = await tx.indication.findUnique({
          where: { id: indicationId },
          select: { status: true, affiliateId: true },
        });

        if (!indication) {
          this.logger.error(`Job ${job.id}: Indication ${indicationId} not found.`);
          throw new Error(`Indication ${indicationId} not found.`);
        }

        if (indication.status !== IndicationStatus.VALIDATED) {
          this.logger.warn(`Job ${job.id}: Indication ${indicationId} is not in VALIDATED status (current: ${indication.status}). Skipping commission creation.`);
          return;
        }

        // Check if ANY CPA commission already exists for this indication
        const existingCpaCommission = await tx.commission.findFirst({
          where: {
            sourceIndicationId: indicationId,
            type: CommissionType.CPA, // Check specifically for CPA
          },
        });

        if (existingCpaCommission) {
          this.logger.warn(`Job ${job.id}: CPA Commission already exists for indication ${indicationId}. Skipping.`);
          return;
        }

        // Corrected: Call createCpaCommission with amount from settings
        await this.commissionService.createCpaCommission(
          indicationId,
          commissionAmountDecimal, // Pass the amount fetched from settings
          tx, // Pass the transaction client
        );

        // Optionally update indication status
        // await tx.indication.update({ where: { id: indicationId }, data: { status: 'COMMISSIONED' } });
      });

      this.logger.log(`Job ${job.id}: Successfully processed CPA commission creation for indication ${indicationId}`);
    } catch (error) {
      this.logger.error(
        `Job ${job.id}: Failed to process CPA commission creation for indication ${indicationId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}


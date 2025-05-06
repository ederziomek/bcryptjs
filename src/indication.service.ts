import { Inject, Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Indication, Prisma, IndicationStatus, CpaQualificationRule, SystemSettings } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { COMMISSION_QUEUE, CREATE_CPA_COMMISSION_JOB } from './jobs/commission.processor'; // Corrected path: ./jobs/

@Injectable()
export class IndicationService {
  private readonly logger = new Logger(IndicationService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue(COMMISSION_QUEUE) private commissionQueue: Queue,
  ) {}

  async create(data: Prisma.IndicationCreateInput): Promise<Indication> {
    return this.prisma.indication.create({ data });
  }

  async findOne(id: string): Promise<Indication | null> {
    return this.prisma.indication.findUnique({ where: { id } });
  }

  async findByIndicatedUserId(indicatedUserId: string): Promise<Indication | null> {
    return this.prisma.indication.findUnique({ where: { indicatedUserId } });
  }

  // --- Qualification Logic ---

  /**
   * Checks if an indication qualifies for CPA commission based on system settings and updates its status.
   * If qualified, adds a job to the commission queue.
   * @param indicationId The ID of the indication to check.
   */
  async checkAndQualifyIndication(indicationId: string): Promise<void> {
    this.logger.log(`Checking qualification for indication ${indicationId}...`);

    const indication = await this.prisma.indication.findUnique({
      where: { id: indicationId },
    });

    if (!indication) {
      this.logger.error(`Indication ${indicationId} not found during qualification check.`);
      throw new NotFoundException(`Indication ${indicationId} not found.`);
    }

    // Only check if status is PENDING_VALIDATION
    if (indication.status !== IndicationStatus.PENDING_VALIDATION) {
      this.logger.log(`Indication ${indicationId} is not pending validation (Status: ${indication.status}). Skipping qualification check.`);
      return;
    }

    // Fetch system settings (assuming only one row exists)
    const settings = await this.prisma.systemSettings.findFirst();
    if (!settings) {
      this.logger.error('System settings not found. Cannot perform qualification check.');
      throw new InternalServerErrorException('System settings not configured.');
    }

    const isQualified = this.evaluateQualificationRules(indication, settings);

    if (isQualified) {
      this.logger.log(`Indication ${indicationId} qualifies for CPA!`);
      const qualifiedAt = new Date(); // Record qualification time

      try {
        // Use transaction ONLY to update status. Commission creation is now async.
        await this.prisma.indication.update({
          where: { id: indicationId },
          data: { status: IndicationStatus.VALIDATED },
        });
        this.logger.log(`Updated indication ${indicationId} status to VALIDATED.`);

        // Add job to the queue
        const jobId = `cpa-${indicationId}-${qualifiedAt.getTime()}`; // Create a potentially unique job ID
        await this.commissionQueue.add(
          CREATE_CPA_COMMISSION_JOB,
          {
            indicationId: indicationId,
            commissionAmount: settings.cpaCommissionAmount.toString(), // Pass as string
            qualifiedAt: qualifiedAt.toISOString(),
          },
          {
            jobId: jobId, // Use the generated job ID
            removeOnComplete: true, // Optional: remove job after completion
            removeOnFail: 50,      // Optional: keep last 50 failed jobs
            attempts: 3,           // Optional: retry 3 times on failure
            backoff: {             // Optional: exponential backoff strategy
              type: 'exponential',
              delay: 1000,         // 1 second delay for first retry
            },
          }
        );
        this.logger.log(`Added job ${jobId} to ${COMMISSION_QUEUE} for indication ${indicationId}.`);

      } catch (error) {
        this.logger.error(`Error during qualification status update or job queuing for indication ${indicationId}: ${error.message}`, error.stack);
        // If status update failed, the job wasn't added. If job add failed, status is already VALIDATED.
        // Consider adding compensating logic if needed (e.g., reverting status if job add fails critically)
        throw new InternalServerErrorException(`Failed to finalize qualification or queue commission job for indication ${indicationId}.`);
      }
    } else {
      this.logger.log(`Indication ${indicationId} does not meet qualification criteria yet.`);
    }
  }

  /**
   * Evaluates the qualification rules based on indication data and system settings.
   * @param indication The indication data.
   * @param settings The system settings.
   * @returns True if the indication qualifies, false otherwise.
   */
  private evaluateQualificationRules(indication: Indication, settings: SystemSettings): boolean {
    const minDeposit = settings.cpaMinimumDeposit;
    const depositMet = indication.firstDepositAmount && indication.firstDepositAmount.gte(minDeposit);

    if (!depositMet) {
      return false; // Minimum deposit is always required
    }

    // Check based on the active rule
    switch (settings.activeCpaRule) {
      case CpaQualificationRule.DEPOSIT_ONLY:
        return true; // Deposit is met, qualifies

      case CpaQualificationRule.DEPOSIT_AND_ACTIVITY:
        const minBets = settings.cpaActivityBetCount;
        const minGgr = settings.cpaActivityMinGgr;
        const betsMet = indication.betCount >= minBets;
        const ggrMet = indication.totalGgr.gte(minGgr);
        return betsMet || ggrMet; // Deposit met AND (bets met OR GGR met)

      default:
        this.logger.warn(`Unknown CPA qualification rule: ${settings.activeCpaRule}`);
        return false;
    }
  }

  // Add other methods like findAll, update status etc. as needed
}


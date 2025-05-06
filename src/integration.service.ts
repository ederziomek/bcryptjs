import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AffiliateService } from './affiliate.service';
import { IndicationService } from './indication.service';
import { WalletService } from './wallet.service';
import { NetworkService } from './network.service';
import { Prisma, IndicationStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library'; // Import Decimal

// DTOs matching the controller
interface UpbetRegistrationEventDto {
  userId: string;
  referralCode?: string;
  timestamp: string;
}

interface UpbetDepositEventDto {
  userId: string;
  amount: number;
  transactionId: string;
  isFirstDeposit: boolean;
  timestamp: string;
}

interface UpbetBetEventDto {
  userId: string;
  betId: string;
  amount: number;
  game: string;
  timestamp: string;
}

interface UpbetGgrEventDto {
  userId: string;
  ggrAmount: number;
  periodStart: string;
  periodEnd: string;
  timestamp: string;
}

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
    private prisma: PrismaService,
    private affiliateService: AffiliateService,
    private indicationService: IndicationService, // IndicationService is injected
    private walletService: WalletService,
    private networkService: NetworkService,
  ) {}

  async handleUpbetRegistration(event: UpbetRegistrationEventDto): Promise<void> {
    this.logger.log(`Processing UPBET Registration Event for user: ${event.userId}`);

    const existingAffiliate = await this.affiliateService.findByUpbetUserId(event.userId);
    if (existingAffiliate) {
      this.logger.warn(`User ${event.userId} already exists as affiliate ${existingAffiliate.id}. Ignoring registration event.`);
      return;
    }
    const existingIndication = await this.indicationService.findByIndicatedUserId(event.userId);
    if (existingIndication) {
      this.logger.warn(`User ${event.userId} already exists as indication ${existingIndication.id}. Ignoring registration event.`);
      return;
    }

    let uplineAffiliateId: string | null = null;
    if (event.referralCode) {
      try {
        uplineAffiliateId = await this.networkService.findUplineByReferral(event.referralCode);
        if (!uplineAffiliateId) {
          this.logger.warn(`Referral code ${event.referralCode} did not resolve to a valid upline affiliate for user ${event.userId}. Proceeding without upline.`);
        }
      } catch (error) {
        this.logger.error(`Error finding upline for referral code ${event.referralCode}: ${error.message}`, error.stack);
        // Decide policy: proceed without upline or reject?
        // Proceeding without upline for now.
      }
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        const newAffiliate = await tx.affiliate.create({
          data: {
            upbetUserId: event.userId,
            uplineAffiliateId: uplineAffiliateId,
          },
        });
        this.logger.log(`Created new affiliate ${newAffiliate.id} for user ${event.userId}`);

        await tx.wallet.create({
          data: { affiliateId: newAffiliate.id },
        });
        this.logger.log(`Created wallet for affiliate ${newAffiliate.id}`);

        if (uplineAffiliateId) {
          await tx.indication.create({
            data: {
              indicatedUserId: event.userId,
              affiliateId: uplineAffiliateId,
              status: IndicationStatus.PENDING_VALIDATION, // Start pending validation now
            },
          });
          this.logger.log(`Created indication record for user ${event.userId} under affiliate ${uplineAffiliateId}`);
        }
      });
    } catch (error) {
      this.logger.error(`Error processing registration transaction for user ${event.userId}: ${error.message}`, error.stack);
      // Rethrow or handle more gracefully depending on requirements
      throw new Error(`Failed to process registration for user ${event.userId}`);
    }
  }

  async handleUpbetFirstDeposit(event: UpbetDepositEventDto): Promise<void> {
    this.logger.log(`Processing UPBET First Deposit Event for user: ${event.userId}`);

    const indication = await this.prisma.indication.findUnique({
      where: { indicatedUserId: event.userId },
    });

    if (!indication) {
      this.logger.warn(`Received first deposit event for user ${event.userId}, but no corresponding indication found. Ignoring.`);
      return;
    }

    // Only process if the indication is pending validation and hasn't received a deposit yet
    if (indication.status === IndicationStatus.PENDING_VALIDATION && !indication.firstDepositAt) {
      try {
        await this.prisma.indication.update({
          where: { id: indication.id },
          data: {
            firstDepositAmount: new Decimal(event.amount),
            firstDepositAt: new Date(event.timestamp),
          },
        });
        this.logger.log(`Updated indication ${indication.id} with first deposit info.`);

        // After updating, check for qualification
        await this.indicationService.checkAndQualifyIndication(indication.id);

      } catch (error) {
        this.logger.error(`Error updating indication ${indication.id} with first deposit: ${error.message}`, error.stack);
        // Consider retry logic or marking as failed
      }
    } else {
      this.logger.warn(`Ignoring first deposit event for indication ${indication.id} (Status: ${indication.status}, Deposit Date: ${indication.firstDepositAt})`);
    }
  }

  async handleUpbetBet(event: UpbetBetEventDto): Promise<void> {
    this.logger.log(`Processing UPBET Bet Event for user: ${event.userId}`);

    const indication = await this.prisma.indication.findUnique({
      where: { indicatedUserId: event.userId },
    });

    if (!indication) {
      this.logger.warn(`Received bet event for user ${event.userId}, but no corresponding indication found. Ignoring.`);
      return;
    }

    // Only process if the indication is pending validation
    if (indication.status === IndicationStatus.PENDING_VALIDATION) {
      try {
        await this.prisma.indication.update({
          where: { id: indication.id },
          data: {
            betCount: { increment: 1 },
          },
        });
        this.logger.log(`Incremented bet count for indication ${indication.id}.`);

        // After updating, check for qualification
        await this.indicationService.checkAndQualifyIndication(indication.id);

      } catch (error) {
        this.logger.error(`Error updating bet count for indication ${indication.id}: ${error.message}`, error.stack);
      }
    } else {
      this.logger.warn(`Ignoring bet event for indication ${indication.id} (Status: ${indication.status})`);
    }
  }

  async handleUpbetGgr(event: UpbetGgrEventDto): Promise<void> {
    this.logger.log(`Processing UPBET GGR Event for user: ${event.userId}`);

    const indication = await this.prisma.indication.findUnique({
      where: { indicatedUserId: event.userId },
    });

    if (!indication) {
      this.logger.warn(`Received GGR event for user ${event.userId}, but no corresponding indication found. Ignoring.`);
      return;
    }

    // Only process if the indication is pending validation
    if (indication.status === IndicationStatus.PENDING_VALIDATION) {
      try {
        // Note: This assumes GGR events are cumulative or represent the total GGR.
        // If they are periodic, the logic might need adjustment (e.g., summing up GGR over time).
        // For simplicity, we assume this event provides the relevant GGR amount for qualification check.
        await this.prisma.indication.update({
          where: { id: indication.id },
          data: {
            // Assuming we just need to store the latest GGR relevant for the check
            // If total GGR needs accumulation, logic needs change.
            // Let's use totalGgr field to accumulate for now.
            totalGgr: { increment: new Decimal(event.ggrAmount) },
          },
        });
        this.logger.log(`Updated total GGR for indication ${indication.id}.`);

        // After updating, check for qualification
        await this.indicationService.checkAndQualifyIndication(indication.id);

      } catch (error) {
        this.logger.error(`Error updating GGR for indication ${indication.id}: ${error.message}`, error.stack);
      }
    } else {
      this.logger.warn(`Ignoring GGR event for indication ${indication.id} (Status: ${indication.status})`);
    }
  }

  // Removed the private placeholder method as the call is now directed to IndicationService
}


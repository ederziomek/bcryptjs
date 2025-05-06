import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet.service'; // Assuming WalletService is in the root src folder for now
import { Prisma, Commission, CommissionType, IndicationStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface FindCommissionsOptions {
  page: number;
  limit: number;
  type?: CommissionType;
  dateFrom?: Date;
  dateTo?: Date;
}

@Injectable()
export class CommissionService {
  private readonly logger = new Logger(CommissionService.name);

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  /**
   * Creates a CPA commission record for a qualified indication and triggers wallet credit.
   * Should be called within a Prisma transaction context initiated by the qualification check.
   * @param indicationId The ID of the qualified indication.
   * @param commissionAmount The amount of the CPA commission.
   * @param tx Prisma Transaction Client.
   */
  async createCpaCommission(
    indicationId: string,
    commissionAmount: Decimal,
    tx: Prisma.TransactionClient, // Expecting transaction client
  ): Promise<void> {
    this.logger.log(`Creating CPA commission for indication ${indicationId}...`);

    // 1. Fetch necessary data (Indication and the referring Affiliate)
    const indication = await tx.indication.findUnique({
      where: { id: indicationId },
      select: { id: true, affiliateId: true, status: true }, // Select only needed fields
    });

    if (!indication) {
      throw new NotFoundException(`Indication ${indicationId} not found during commission creation.`);
    }
    if (indication.status !== IndicationStatus.VALIDATED) {
        // This should ideally not happen if called correctly after qualification
        throw new InternalServerErrorException(`Attempted to create commission for non-validated indication ${indicationId}.`);
    }
    if (!indication.affiliateId) {
        throw new InternalServerErrorException(`Indication ${indicationId} does not have a referring affiliate.`);
    }

    // 2. Create the Commission record
    const newCommission = await tx.commission.create({
      data: {
        amount: commissionAmount,
        type: CommissionType.CPA,
        recipientAffiliateId: indication.affiliateId,
        sourceIndicationId: indication.id,
        // walletTransactionId will be linked later by WalletService
      },
    });
    this.logger.log(`Created Commission ${newCommission.id} for indication ${indicationId}.`);

    // 3. Trigger Wallet Credit (Step 1.7)
    // Pass the commission ID and transaction client to WalletService
    await this.walletService.creditCommission(
      indication.affiliateId,
      newCommission.id,
      commissionAmount,
      `CPA Commission for indication ${indication.id}`,
      tx,
    );

    this.logger.log(`Triggered wallet credit for commission ${newCommission.id}.`);

    // Note: The link between Commission and WalletTransaction
    // should ideally be handled within the WalletService.creditCommission method
    // by updating the commission record with the transaction ID.
  }

  /**
   * Finds commissions for a specific affiliate with pagination and filtering.
   * @param affiliateId The ID of the affiliate whose commissions to find.
   * @param options Filtering and pagination options.
   * @returns A list of commissions and the total count.
   */
  async findManyByAffiliate(
    affiliateId: string,
    options: FindCommissionsOptions,
  ): Promise<{ commissions: Commission[], total: number }> {
    const { page, limit, type, dateFrom, dateTo } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.CommissionWhereInput = {
      recipientAffiliateId: affiliateId,
    };

    if (type) {
      where.type = type;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    // No need to check Object.keys(where.createdAt).length === 0 anymore
    // as where.createdAt is only added if dateFrom or dateTo exists.

    const [commissions, total] = await this.prisma.$transaction([
      this.prisma.commission.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc', // Default order by creation date
        },
        // Include related data if needed (e.g., source indication)
        // include: { sourceIndication: true }
      }),
      this.prisma.commission.count({ where }),
    ]);

    return { commissions, total };
  }

  // Add methods for other commission types (RevShare, etc.) later
}


import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Wallet, Prisma, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private prisma: PrismaService) {}

  // Method to create a wallet, typically called when an affiliate is created
  async create(data: Prisma.WalletCreateInput): Promise<Wallet> {
    return this.prisma.wallet.create({ data });
  }

  async findOneByAffiliateId(affiliateId: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({ where: { affiliateId } });
  }

  /**
   * Credits a commission amount to an affiliate's wallet within a transaction.
   * Creates a WalletTransaction and links it back to the Commission.
   * @param affiliateId The ID of the affiliate receiving the credit.
   * @param commissionId The ID of the source commission.
   * @param amount The amount to credit.
   * @param description Description for the transaction.
   * @param tx Prisma Transaction Client.
   */
  async creditCommission(
    affiliateId: string,
    commissionId: string,
    amount: Decimal,
    description: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    this.logger.log(`Crediting commission ${commissionId} to affiliate ${affiliateId}...`);

    if (amount.lessThanOrEqualTo(0)) {
      // Should not happen for commissions, but good practice
      throw new Error('Credit amount must be positive');
    }

    // 1. Find the wallet (within transaction)
    const wallet = await tx.wallet.findUnique({
      where: { affiliateId },
    });

    if (!wallet) {
      // This indicates a data integrity issue if an affiliate doesn't have a wallet
      this.logger.error(`Wallet not found for affiliate ${affiliateId} during commission credit.`);
      throw new NotFoundException(`Wallet for affiliate ${affiliateId} not found.`);
    }

    // 2. Update wallet balance (within transaction)
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
    this.logger.log(`Updated balance for wallet ${wallet.id} to ${updatedWallet.balance}.`);

    // 3. Create WalletTransaction (within transaction)
    const walletTransaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount: amount,
        type: TransactionType.CREDIT,
        description: description,
        commission: {
          connect: { id: commissionId }, // Link to the commission
        },
      },
    });
    this.logger.log(`Created WalletTransaction ${walletTransaction.id} for commission ${commissionId}.`);

    // 4. Link WalletTransaction back to Commission (within transaction)
    // This ensures the two-way relation is established
    await tx.commission.update({
        where: { id: commissionId },
        data: {
            walletTransactionId: walletTransaction.id,
        },
    });
    this.logger.log(`Linked WalletTransaction ${walletTransaction.id} back to Commission ${commissionId}.`);
  }

  // Generic credit method (outside commission flow, might need adjustments or removal)
  // Consider if this generic credit is still needed or if all credits should have specific sources.
  async credit(affiliateId: string, amount: Decimal, description: string): Promise<Wallet> {
    this.logger.warn(`Using generic credit method for affiliate ${affiliateId}. Consider using source-specific methods.`);
    if (amount.lessThanOrEqualTo(0)) {
      throw new Error('Credit amount must be positive');
    }
    // Use transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { affiliateId } });
      if (!wallet) {
        throw new NotFoundException(`Wallet for affiliate ${affiliateId} not found.`);
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: amount,
          type: TransactionType.CREDIT,
          description: description,
          // No commission link here
        },
      });

      return updatedWallet;
    });
  }

  // Method to remove funds (debit) - Add later for withdrawals
  // async debit(affiliateId: string, amount: number, description: string): Promise<Wallet> { ... }

  // Add findOne by ID, findAll etc. later if needed
}


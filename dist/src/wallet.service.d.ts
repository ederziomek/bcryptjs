import { PrismaService } from './prisma/prisma.service';
import { Wallet, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
export declare class WalletService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(data: Prisma.WalletCreateInput): Promise<Wallet>;
    findOneByAffiliateId(affiliateId: string): Promise<Wallet | null>;
    creditCommission(affiliateId: string, commissionId: string, amount: Decimal, description: string, tx: Prisma.TransactionClient): Promise<void>;
    credit(affiliateId: string, amount: Decimal, description: string): Promise<Wallet>;
}

import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet.service';
import { Prisma, Commission, CommissionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
interface FindCommissionsOptions {
    page: number;
    limit: number;
    type?: CommissionType;
    dateFrom?: Date;
    dateTo?: Date;
}
export declare class CommissionService {
    private prisma;
    private walletService;
    private readonly logger;
    constructor(prisma: PrismaService, walletService: WalletService);
    createCpaCommission(indicationId: string, commissionAmount: Decimal, tx: Prisma.TransactionClient): Promise<void>;
    findManyByAffiliate(affiliateId: string, options: FindCommissionsOptions): Promise<{
        commissions: Commission[];
        total: number;
    }>;
}
export {};

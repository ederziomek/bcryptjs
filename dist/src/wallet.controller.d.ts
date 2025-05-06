import { WalletService } from './wallet.service';
import { Decimal } from '@prisma/client/runtime/library';
declare class CreditWalletDto {
    amount: string;
    description: string;
}
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    findOneByAffiliateId(affiliateId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        balance: Decimal;
        affiliateId: string;
    } | null>;
    creditWallet(affiliateId: string, creditDto: CreditWalletDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        balance: Decimal;
        affiliateId: string;
    }>;
}
export {};

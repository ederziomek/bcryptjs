import { PrismaService } from './prisma/prisma.service';
import { AffiliateService } from './affiliate.service';
import { IndicationService } from './indication.service';
import { WalletService } from './wallet.service';
import { NetworkService } from './network.service';
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
export declare class IntegrationService {
    private prisma;
    private affiliateService;
    private indicationService;
    private walletService;
    private networkService;
    private readonly logger;
    constructor(prisma: PrismaService, affiliateService: AffiliateService, indicationService: IndicationService, walletService: WalletService, networkService: NetworkService);
    handleUpbetRegistration(event: UpbetRegistrationEventDto): Promise<void>;
    handleUpbetFirstDeposit(event: UpbetDepositEventDto): Promise<void>;
    handleUpbetBet(event: UpbetBetEventDto): Promise<void>;
    handleUpbetGgr(event: UpbetGgrEventDto): Promise<void>;
}
export {};

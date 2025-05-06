import { IntegrationService } from './integration.service';
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
export declare class IntegrationController {
    private readonly integrationService;
    private readonly logger;
    constructor(integrationService: IntegrationService);
    handleUpbetRegistration(event: UpbetRegistrationEventDto): Promise<{
        message: string;
    }>;
    handleUpbetDeposit(event: UpbetDepositEventDto): Promise<{
        message: string;
    }>;
    handleUpbetBet(event: UpbetBetEventDto): Promise<{
        message: string;
    }>;
    handleUpbetGgr(event: UpbetGgrEventDto): Promise<{
        message: string;
    }>;
}
export {};

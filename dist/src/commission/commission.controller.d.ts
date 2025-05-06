import { CommissionService } from './commission.service';
import { Commission, CommissionType } from '@prisma/client';
declare class FindCommissionsQueryDto {
    page?: number;
    limit?: number;
    type?: CommissionType;
    dateFrom?: string;
    dateTo?: string;
}
export declare class CommissionController {
    private readonly commissionService;
    private readonly logger;
    constructor(commissionService: CommissionService);
    findCommissionsByAffiliate(affiliateId: string, query: FindCommissionsQueryDto): Promise<{
        commissions: Commission[];
        total: number;
    }>;
}
export {};

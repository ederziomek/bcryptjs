import { AffiliateService } from './affiliate.service';
import { Prisma } from '@prisma/client';
export declare class AffiliateController {
    private readonly affiliateService;
    constructor(affiliateService: AffiliateService);
    create(createAffiliateDto: Prisma.AffiliateCreateInput): Promise<{
        id: string;
        upbetUserId: string;
        level: import(".prisma/client").$Enums.AffiliateLevel;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        createdAt: Date;
        updatedAt: Date;
        uplineAffiliateId: string | null;
    }>;
    findOne(id: string): Promise<{
        id: string;
        upbetUserId: string;
        level: import(".prisma/client").$Enums.AffiliateLevel;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        createdAt: Date;
        updatedAt: Date;
        uplineAffiliateId: string | null;
    } | null>;
}

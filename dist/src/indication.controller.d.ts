import { IndicationService } from './indication.service';
import { Prisma } from '@prisma/client';
export declare class IndicationController {
    private readonly indicationService;
    constructor(indicationService: IndicationService);
    create(createIndicationDto: Prisma.IndicationCreateInput): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.IndicationStatus;
        createdAt: Date;
        updatedAt: Date;
        affiliateId: string;
        indicatedUserId: string;
        firstDepositAmount: Prisma.Decimal | null;
        firstDepositAt: Date | null;
        betCount: number;
        totalGgr: Prisma.Decimal;
    }>;
    findOne(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.IndicationStatus;
        createdAt: Date;
        updatedAt: Date;
        affiliateId: string;
        indicatedUserId: string;
        firstDepositAmount: Prisma.Decimal | null;
        firstDepositAt: Date | null;
        betCount: number;
        totalGgr: Prisma.Decimal;
    } | null>;
}

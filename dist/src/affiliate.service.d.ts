import { PrismaService } from './prisma/prisma.service';
import { Affiliate, Prisma } from '@prisma/client';
export declare class AffiliateService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.AffiliateCreateInput): Promise<Affiliate>;
    findOne(id: string): Promise<Affiliate | null>;
    findByUpbetUserId(upbetUserId: string): Promise<Affiliate | null>;
}

import { PrismaService } from './prisma/prisma.service';
import { Affiliate } from '@prisma/client';
export declare class NetworkService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findUplineByReferral(referralIdentifier: string): Promise<string | null>;
    getDirectDownline(affiliateId: string): Promise<Affiliate[]>;
    getDirectUpline(affiliateId: string): Promise<Affiliate | null>;
    getFullDownline(affiliateId: string): Promise<Affiliate[]>;
    getUplineChain(affiliateId: string): Promise<Affiliate[]>;
    calculateAffiliateLevel(affiliateId: string): Promise<void>;
}

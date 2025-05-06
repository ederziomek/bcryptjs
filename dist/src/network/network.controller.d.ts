import { NetworkService } from '../network.service';
import { Affiliate } from '@prisma/client';
export declare class NetworkController {
    private readonly networkService;
    private readonly logger;
    constructor(networkService: NetworkService);
    getDirectDownline(affiliateId: string): Promise<Affiliate[]>;
    getFullDownline(affiliateId: string): Promise<Affiliate[]>;
    getDirectUpline(affiliateId: string): Promise<Affiliate | null>;
    getUplineChain(affiliateId: string): Promise<Affiliate[]>;
}

import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommissionService } from '../commission/commission.service';
import { PrismaService } from '../prisma/prisma.service';
export declare const COMMISSION_QUEUE = "commission-queue";
export declare const CREATE_CPA_COMMISSION_JOB = "create-cpa-commission";
interface CreateCpaCommissionJobData {
    indicationId: string;
    qualifiedAt: string;
}
export declare class CommissionProcessor extends WorkerHost {
    private readonly commissionService;
    private readonly prisma;
    private readonly logger;
    constructor(commissionService: CommissionService, prisma: PrismaService);
    process(job: Job<CreateCpaCommissionJobData, any, string>): Promise<any>;
    private handleCreateCpaCommission;
}
export {};

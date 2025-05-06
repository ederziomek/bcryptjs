import { PrismaService } from './prisma/prisma.service';
import { Indication, Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
export declare class IndicationService {
    private prisma;
    private commissionQueue;
    private readonly logger;
    constructor(prisma: PrismaService, commissionQueue: Queue);
    create(data: Prisma.IndicationCreateInput): Promise<Indication>;
    findOne(id: string): Promise<Indication | null>;
    findByIndicatedUserId(indicatedUserId: string): Promise<Indication | null>;
    checkAndQualifyIndication(indicationId: string): Promise<void>;
    private evaluateQualificationRules;
}

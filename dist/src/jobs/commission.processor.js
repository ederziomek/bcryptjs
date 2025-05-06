"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CommissionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionProcessor = exports.CREATE_CPA_COMMISSION_JOB = exports.COMMISSION_QUEUE = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const commission_service_1 = require("../commission/commission.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
exports.COMMISSION_QUEUE = 'commission-queue';
exports.CREATE_CPA_COMMISSION_JOB = 'create-cpa-commission';
let CommissionProcessor = CommissionProcessor_1 = class CommissionProcessor extends bullmq_1.WorkerHost {
    commissionService;
    prisma;
    logger = new common_1.Logger(CommissionProcessor_1.name);
    constructor(commissionService, prisma) {
        super();
        this.commissionService = commissionService;
        this.prisma = prisma;
    }
    async process(job) {
        if (job.name === exports.CREATE_CPA_COMMISSION_JOB) {
            return this.handleCreateCpaCommission(job);
        }
        else {
            this.logger.warn(`Received job with unknown name: ${job.name}`);
            return {};
        }
    }
    async handleCreateCpaCommission(job) {
        const { indicationId, qualifiedAt } = job.data;
        this.logger.log(`Processing job ${job.id} (${job.name}): Create CPA commission for indication ${indicationId}`);
        try {
            await this.prisma.$transaction(async (tx) => {
                const settings = await tx.systemSettings.findFirst();
                if (!settings || !settings.cpaCommissionAmount) {
                    this.logger.error(`Job ${job.id}: SystemSettings or cpaCommissionAmount not found.`);
                    throw new Error('SystemSettings or cpaCommissionAmount not configured.');
                }
                const commissionAmountDecimal = settings.cpaCommissionAmount;
                const indication = await tx.indication.findUnique({
                    where: { id: indicationId },
                    select: { status: true, affiliateId: true },
                });
                if (!indication) {
                    this.logger.error(`Job ${job.id}: Indication ${indicationId} not found.`);
                    throw new Error(`Indication ${indicationId} not found.`);
                }
                if (indication.status !== client_1.IndicationStatus.VALIDATED) {
                    this.logger.warn(`Job ${job.id}: Indication ${indicationId} is not in VALIDATED status (current: ${indication.status}). Skipping commission creation.`);
                    return;
                }
                const existingCpaCommission = await tx.commission.findFirst({
                    where: {
                        sourceIndicationId: indicationId,
                        type: client_1.CommissionType.CPA,
                    },
                });
                if (existingCpaCommission) {
                    this.logger.warn(`Job ${job.id}: CPA Commission already exists for indication ${indicationId}. Skipping.`);
                    return;
                }
                await this.commissionService.createCpaCommission(indicationId, commissionAmountDecimal, tx);
            });
            this.logger.log(`Job ${job.id}: Successfully processed CPA commission creation for indication ${indicationId}`);
        }
        catch (error) {
            this.logger.error(`Job ${job.id}: Failed to process CPA commission creation for indication ${indicationId}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CommissionProcessor = CommissionProcessor;
exports.CommissionProcessor = CommissionProcessor = CommissionProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(exports.COMMISSION_QUEUE),
    __metadata("design:paramtypes", [commission_service_1.CommissionService,
        prisma_service_1.PrismaService])
], CommissionProcessor);
//# sourceMappingURL=commission.processor.js.map
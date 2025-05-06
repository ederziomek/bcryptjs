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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var IndicationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndicationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
const client_1 = require("@prisma/client");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const commission_processor_1 = require("./jobs/commission.processor");
let IndicationService = IndicationService_1 = class IndicationService {
    prisma;
    commissionQueue;
    logger = new common_1.Logger(IndicationService_1.name);
    constructor(prisma, commissionQueue) {
        this.prisma = prisma;
        this.commissionQueue = commissionQueue;
    }
    async create(data) {
        return this.prisma.indication.create({ data });
    }
    async findOne(id) {
        return this.prisma.indication.findUnique({ where: { id } });
    }
    async findByIndicatedUserId(indicatedUserId) {
        return this.prisma.indication.findUnique({ where: { indicatedUserId } });
    }
    async checkAndQualifyIndication(indicationId) {
        this.logger.log(`Checking qualification for indication ${indicationId}...`);
        const indication = await this.prisma.indication.findUnique({
            where: { id: indicationId },
        });
        if (!indication) {
            this.logger.error(`Indication ${indicationId} not found during qualification check.`);
            throw new common_1.NotFoundException(`Indication ${indicationId} not found.`);
        }
        if (indication.status !== client_1.IndicationStatus.PENDING_VALIDATION) {
            this.logger.log(`Indication ${indicationId} is not pending validation (Status: ${indication.status}). Skipping qualification check.`);
            return;
        }
        const settings = await this.prisma.systemSettings.findFirst();
        if (!settings) {
            this.logger.error('System settings not found. Cannot perform qualification check.');
            throw new common_1.InternalServerErrorException('System settings not configured.');
        }
        const isQualified = this.evaluateQualificationRules(indication, settings);
        if (isQualified) {
            this.logger.log(`Indication ${indicationId} qualifies for CPA!`);
            const qualifiedAt = new Date();
            try {
                await this.prisma.indication.update({
                    where: { id: indicationId },
                    data: { status: client_1.IndicationStatus.VALIDATED },
                });
                this.logger.log(`Updated indication ${indicationId} status to VALIDATED.`);
                const jobId = `cpa-${indicationId}-${qualifiedAt.getTime()}`;
                await this.commissionQueue.add(commission_processor_1.CREATE_CPA_COMMISSION_JOB, {
                    indicationId: indicationId,
                    commissionAmount: settings.cpaCommissionAmount.toString(),
                    qualifiedAt: qualifiedAt.toISOString(),
                }, {
                    jobId: jobId,
                    removeOnComplete: true,
                    removeOnFail: 50,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                });
                this.logger.log(`Added job ${jobId} to ${commission_processor_1.COMMISSION_QUEUE} for indication ${indicationId}.`);
            }
            catch (error) {
                this.logger.error(`Error during qualification status update or job queuing for indication ${indicationId}: ${error.message}`, error.stack);
                throw new common_1.InternalServerErrorException(`Failed to finalize qualification or queue commission job for indication ${indicationId}.`);
            }
        }
        else {
            this.logger.log(`Indication ${indicationId} does not meet qualification criteria yet.`);
        }
    }
    evaluateQualificationRules(indication, settings) {
        const minDeposit = settings.cpaMinimumDeposit;
        const depositMet = indication.firstDepositAmount && indication.firstDepositAmount.gte(minDeposit);
        if (!depositMet) {
            return false;
        }
        switch (settings.activeCpaRule) {
            case client_1.CpaQualificationRule.DEPOSIT_ONLY:
                return true;
            case client_1.CpaQualificationRule.DEPOSIT_AND_ACTIVITY:
                const minBets = settings.cpaActivityBetCount;
                const minGgr = settings.cpaActivityMinGgr;
                const betsMet = indication.betCount >= minBets;
                const ggrMet = indication.totalGgr.gte(minGgr);
                return betsMet || ggrMet;
            default:
                this.logger.warn(`Unknown CPA qualification rule: ${settings.activeCpaRule}`);
                return false;
        }
    }
};
exports.IndicationService = IndicationService;
exports.IndicationService = IndicationService = IndicationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)(commission_processor_1.COMMISSION_QUEUE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], IndicationService);
//# sourceMappingURL=indication.service.js.map
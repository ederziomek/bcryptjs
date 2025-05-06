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
var CommissionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const wallet_service_1 = require("../wallet.service");
const client_1 = require("@prisma/client");
let CommissionService = CommissionService_1 = class CommissionService {
    prisma;
    walletService;
    logger = new common_1.Logger(CommissionService_1.name);
    constructor(prisma, walletService) {
        this.prisma = prisma;
        this.walletService = walletService;
    }
    async createCpaCommission(indicationId, commissionAmount, tx) {
        this.logger.log(`Creating CPA commission for indication ${indicationId}...`);
        const indication = await tx.indication.findUnique({
            where: { id: indicationId },
            select: { id: true, affiliateId: true, status: true },
        });
        if (!indication) {
            throw new common_1.NotFoundException(`Indication ${indicationId} not found during commission creation.`);
        }
        if (indication.status !== client_1.IndicationStatus.VALIDATED) {
            throw new common_1.InternalServerErrorException(`Attempted to create commission for non-validated indication ${indicationId}.`);
        }
        if (!indication.affiliateId) {
            throw new common_1.InternalServerErrorException(`Indication ${indicationId} does not have a referring affiliate.`);
        }
        const newCommission = await tx.commission.create({
            data: {
                amount: commissionAmount,
                type: client_1.CommissionType.CPA,
                recipientAffiliateId: indication.affiliateId,
                sourceIndicationId: indication.id,
            },
        });
        this.logger.log(`Created Commission ${newCommission.id} for indication ${indicationId}.`);
        await this.walletService.creditCommission(indication.affiliateId, newCommission.id, commissionAmount, `CPA Commission for indication ${indication.id}`, tx);
        this.logger.log(`Triggered wallet credit for commission ${newCommission.id}.`);
    }
    async findManyByAffiliate(affiliateId, options) {
        const { page, limit, type, dateFrom, dateTo } = options;
        const skip = (page - 1) * limit;
        const where = {
            recipientAffiliateId: affiliateId,
        };
        if (type) {
            where.type = type;
        }
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) {
                where.createdAt.gte = dateFrom;
            }
            if (dateTo) {
                where.createdAt.lte = dateTo;
            }
        }
        const [commissions, total] = await this.prisma.$transaction([
            this.prisma.commission.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.commission.count({ where }),
        ]);
        return { commissions, total };
    }
};
exports.CommissionService = CommissionService;
exports.CommissionService = CommissionService = CommissionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService])
], CommissionService);
//# sourceMappingURL=commission.service.js.map
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
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
const client_1 = require("@prisma/client");
let WalletService = WalletService_1 = class WalletService {
    prisma;
    logger = new common_1.Logger(WalletService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.wallet.create({ data });
    }
    async findOneByAffiliateId(affiliateId) {
        return this.prisma.wallet.findUnique({ where: { affiliateId } });
    }
    async creditCommission(affiliateId, commissionId, amount, description, tx) {
        this.logger.log(`Crediting commission ${commissionId} to affiliate ${affiliateId}...`);
        if (amount.lessThanOrEqualTo(0)) {
            throw new Error('Credit amount must be positive');
        }
        const wallet = await tx.wallet.findUnique({
            where: { affiliateId },
        });
        if (!wallet) {
            this.logger.error(`Wallet not found for affiliate ${affiliateId} during commission credit.`);
            throw new common_1.NotFoundException(`Wallet for affiliate ${affiliateId} not found.`);
        }
        const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                balance: {
                    increment: amount,
                },
            },
        });
        this.logger.log(`Updated balance for wallet ${wallet.id} to ${updatedWallet.balance}.`);
        const walletTransaction = await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                amount: amount,
                type: client_1.TransactionType.CREDIT,
                description: description,
                commission: {
                    connect: { id: commissionId },
                },
            },
        });
        this.logger.log(`Created WalletTransaction ${walletTransaction.id} for commission ${commissionId}.`);
        await tx.commission.update({
            where: { id: commissionId },
            data: {
                walletTransactionId: walletTransaction.id,
            },
        });
        this.logger.log(`Linked WalletTransaction ${walletTransaction.id} back to Commission ${commissionId}.`);
    }
    async credit(affiliateId, amount, description) {
        this.logger.warn(`Using generic credit method for affiliate ${affiliateId}. Consider using source-specific methods.`);
        if (amount.lessThanOrEqualTo(0)) {
            throw new Error('Credit amount must be positive');
        }
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { affiliateId } });
            if (!wallet) {
                throw new common_1.NotFoundException(`Wallet for affiliate ${affiliateId} not found.`);
            }
            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
            });
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount: amount,
                    type: client_1.TransactionType.CREDIT,
                    description: description,
                },
            });
            return updatedWallet;
        });
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map
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
var IntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
const affiliate_service_1 = require("./affiliate.service");
const indication_service_1 = require("./indication.service");
const wallet_service_1 = require("./wallet.service");
const network_service_1 = require("./network.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
let IntegrationService = IntegrationService_1 = class IntegrationService {
    prisma;
    affiliateService;
    indicationService;
    walletService;
    networkService;
    logger = new common_1.Logger(IntegrationService_1.name);
    constructor(prisma, affiliateService, indicationService, walletService, networkService) {
        this.prisma = prisma;
        this.affiliateService = affiliateService;
        this.indicationService = indicationService;
        this.walletService = walletService;
        this.networkService = networkService;
    }
    async handleUpbetRegistration(event) {
        this.logger.log(`Processing UPBET Registration Event for user: ${event.userId}`);
        const existingAffiliate = await this.affiliateService.findByUpbetUserId(event.userId);
        if (existingAffiliate) {
            this.logger.warn(`User ${event.userId} already exists as affiliate ${existingAffiliate.id}. Ignoring registration event.`);
            return;
        }
        const existingIndication = await this.indicationService.findByIndicatedUserId(event.userId);
        if (existingIndication) {
            this.logger.warn(`User ${event.userId} already exists as indication ${existingIndication.id}. Ignoring registration event.`);
            return;
        }
        let uplineAffiliateId = null;
        if (event.referralCode) {
            try {
                uplineAffiliateId = await this.networkService.findUplineByReferral(event.referralCode);
                if (!uplineAffiliateId) {
                    this.logger.warn(`Referral code ${event.referralCode} did not resolve to a valid upline affiliate for user ${event.userId}. Proceeding without upline.`);
                }
            }
            catch (error) {
                this.logger.error(`Error finding upline for referral code ${event.referralCode}: ${error.message}`, error.stack);
            }
        }
        try {
            await this.prisma.$transaction(async (tx) => {
                const newAffiliate = await tx.affiliate.create({
                    data: {
                        upbetUserId: event.userId,
                        uplineAffiliateId: uplineAffiliateId,
                    },
                });
                this.logger.log(`Created new affiliate ${newAffiliate.id} for user ${event.userId}`);
                await tx.wallet.create({
                    data: { affiliateId: newAffiliate.id },
                });
                this.logger.log(`Created wallet for affiliate ${newAffiliate.id}`);
                if (uplineAffiliateId) {
                    await tx.indication.create({
                        data: {
                            indicatedUserId: event.userId,
                            affiliateId: uplineAffiliateId,
                            status: client_1.IndicationStatus.PENDING_VALIDATION,
                        },
                    });
                    this.logger.log(`Created indication record for user ${event.userId} under affiliate ${uplineAffiliateId}`);
                }
            });
        }
        catch (error) {
            this.logger.error(`Error processing registration transaction for user ${event.userId}: ${error.message}`, error.stack);
            throw new Error(`Failed to process registration for user ${event.userId}`);
        }
    }
    async handleUpbetFirstDeposit(event) {
        this.logger.log(`Processing UPBET First Deposit Event for user: ${event.userId}`);
        const indication = await this.prisma.indication.findUnique({
            where: { indicatedUserId: event.userId },
        });
        if (!indication) {
            this.logger.warn(`Received first deposit event for user ${event.userId}, but no corresponding indication found. Ignoring.`);
            return;
        }
        if (indication.status === client_1.IndicationStatus.PENDING_VALIDATION && !indication.firstDepositAt) {
            try {
                await this.prisma.indication.update({
                    where: { id: indication.id },
                    data: {
                        firstDepositAmount: new library_1.Decimal(event.amount),
                        firstDepositAt: new Date(event.timestamp),
                    },
                });
                this.logger.log(`Updated indication ${indication.id} with first deposit info.`);
                await this.indicationService.checkAndQualifyIndication(indication.id);
            }
            catch (error) {
                this.logger.error(`Error updating indication ${indication.id} with first deposit: ${error.message}`, error.stack);
            }
        }
        else {
            this.logger.warn(`Ignoring first deposit event for indication ${indication.id} (Status: ${indication.status}, Deposit Date: ${indication.firstDepositAt})`);
        }
    }
    async handleUpbetBet(event) {
        this.logger.log(`Processing UPBET Bet Event for user: ${event.userId}`);
        const indication = await this.prisma.indication.findUnique({
            where: { indicatedUserId: event.userId },
        });
        if (!indication) {
            this.logger.warn(`Received bet event for user ${event.userId}, but no corresponding indication found. Ignoring.`);
            return;
        }
        if (indication.status === client_1.IndicationStatus.PENDING_VALIDATION) {
            try {
                await this.prisma.indication.update({
                    where: { id: indication.id },
                    data: {
                        betCount: { increment: 1 },
                    },
                });
                this.logger.log(`Incremented bet count for indication ${indication.id}.`);
                await this.indicationService.checkAndQualifyIndication(indication.id);
            }
            catch (error) {
                this.logger.error(`Error updating bet count for indication ${indication.id}: ${error.message}`, error.stack);
            }
        }
        else {
            this.logger.warn(`Ignoring bet event for indication ${indication.id} (Status: ${indication.status})`);
        }
    }
    async handleUpbetGgr(event) {
        this.logger.log(`Processing UPBET GGR Event for user: ${event.userId}`);
        const indication = await this.prisma.indication.findUnique({
            where: { indicatedUserId: event.userId },
        });
        if (!indication) {
            this.logger.warn(`Received GGR event for user ${event.userId}, but no corresponding indication found. Ignoring.`);
            return;
        }
        if (indication.status === client_1.IndicationStatus.PENDING_VALIDATION) {
            try {
                await this.prisma.indication.update({
                    where: { id: indication.id },
                    data: {
                        totalGgr: { increment: new library_1.Decimal(event.ggrAmount) },
                    },
                });
                this.logger.log(`Updated total GGR for indication ${indication.id}.`);
                await this.indicationService.checkAndQualifyIndication(indication.id);
            }
            catch (error) {
                this.logger.error(`Error updating GGR for indication ${indication.id}: ${error.message}`, error.stack);
            }
        }
        else {
            this.logger.warn(`Ignoring GGR event for indication ${indication.id} (Status: ${indication.status})`);
        }
    }
};
exports.IntegrationService = IntegrationService;
exports.IntegrationService = IntegrationService = IntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        affiliate_service_1.AffiliateService,
        indication_service_1.IndicationService,
        wallet_service_1.WalletService,
        network_service_1.NetworkService])
], IntegrationService);
//# sourceMappingURL=integration.service.js.map
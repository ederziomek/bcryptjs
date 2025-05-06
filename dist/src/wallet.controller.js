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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const wallet_service_1 = require("./wallet.service");
const library_1 = require("@prisma/client/runtime/library");
class CreditWalletDto {
    amount;
    description;
}
let WalletController = class WalletController {
    walletService;
    constructor(walletService) {
        this.walletService = walletService;
    }
    findOneByAffiliateId(affiliateId) {
        return this.walletService.findOneByAffiliateId(affiliateId);
    }
    creditWallet(affiliateId, creditDto) {
        const amountDecimal = new library_1.Decimal(creditDto.amount);
        return this.walletService.credit(affiliateId, amountDecimal, creditDto.description);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)('affiliate/:affiliateId'),
    __param(0, (0, common_1.Param)('affiliateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "findOneByAffiliateId", null);
__decorate([
    (0, common_1.Post)('affiliate/:affiliateId/credit'),
    __param(0, (0, common_1.Param)('affiliateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreditWalletDto]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "creditWallet", null);
exports.WalletController = WalletController = __decorate([
    (0, common_1.Controller)('wallets'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map
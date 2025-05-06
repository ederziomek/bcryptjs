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
var NetworkController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkController = void 0;
const common_1 = require("@nestjs/common");
const network_service_1 = require("../network.service");
class PaginationQueryDto {
    page;
    limit;
}
let NetworkController = NetworkController_1 = class NetworkController {
    networkService;
    logger = new common_1.Logger(NetworkController_1.name);
    constructor(networkService) {
        this.networkService = networkService;
    }
    async getDirectDownline(affiliateId) {
        this.logger.log(`Fetching direct downline for affiliate ${affiliateId}`);
        return this.networkService.getDirectDownline(affiliateId);
    }
    async getFullDownline(affiliateId) {
        this.logger.log(`Fetching full downline for affiliate ${affiliateId}`);
        return this.networkService.getFullDownline(affiliateId);
    }
    async getDirectUpline(affiliateId) {
        this.logger.log(`Fetching direct upline for affiliate ${affiliateId}`);
        return this.networkService.getDirectUpline(affiliateId);
    }
    async getUplineChain(affiliateId) {
        this.logger.log(`Fetching upline chain for affiliate ${affiliateId}`);
        return this.networkService.getUplineChain(affiliateId);
    }
};
exports.NetworkController = NetworkController;
__decorate([
    (0, common_1.Get)('affiliate/:affiliateId/downline/direct'),
    __param(0, (0, common_1.Param)('affiliateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NetworkController.prototype, "getDirectDownline", null);
__decorate([
    (0, common_1.Get)('affiliate/:affiliateId/downline/full'),
    __param(0, (0, common_1.Param)('affiliateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NetworkController.prototype, "getFullDownline", null);
__decorate([
    (0, common_1.Get)('affiliate/:affiliateId/upline/direct'),
    __param(0, (0, common_1.Param)('affiliateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NetworkController.prototype, "getDirectUpline", null);
__decorate([
    (0, common_1.Get)('affiliate/:affiliateId/upline/chain'),
    __param(0, (0, common_1.Param)('affiliateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NetworkController.prototype, "getUplineChain", null);
exports.NetworkController = NetworkController = NetworkController_1 = __decorate([
    (0, common_1.Controller)('network'),
    __metadata("design:paramtypes", [network_service_1.NetworkService])
], NetworkController);
//# sourceMappingURL=network.controller.js.map
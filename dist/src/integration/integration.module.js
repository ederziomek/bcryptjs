"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const integration_service_1 = require("../integration.service");
const integration_controller_1 = require("../integration.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const affiliate_module_1 = require("../affiliate/affiliate.module");
const indication_module_1 = require("../indication/indication.module");
const wallet_module_1 = require("../wallet/wallet.module");
const network_module_1 = require("../network/network.module");
let IntegrationModule = class IntegrationModule {
};
exports.IntegrationModule = IntegrationModule;
exports.IntegrationModule = IntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            affiliate_module_1.AffiliateModule,
            indication_module_1.IndicationModule,
            wallet_module_1.WalletModule,
            network_module_1.NetworkModule,
        ],
        controllers: [integration_controller_1.IntegrationController],
        providers: [integration_service_1.IntegrationService],
        exports: [integration_service_1.IntegrationService],
    })
], IntegrationModule);
//# sourceMappingURL=integration.module.js.map
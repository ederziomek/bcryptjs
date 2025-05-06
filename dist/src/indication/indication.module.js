"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndicationModule = void 0;
const common_1 = require("@nestjs/common");
const indication_service_1 = require("../indication.service");
const indication_controller_1 = require("../indication.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const bullmq_1 = require("@nestjs/bullmq");
const commission_processor_1 = require("../jobs/commission.processor");
let IndicationModule = class IndicationModule {
};
exports.IndicationModule = IndicationModule;
exports.IndicationModule = IndicationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            bullmq_1.BullModule.registerQueue({
                name: commission_processor_1.COMMISSION_QUEUE,
            }),
        ],
        controllers: [indication_controller_1.IndicationController],
        providers: [indication_service_1.IndicationService],
        exports: [indication_service_1.IndicationService],
    })
], IndicationModule);
//# sourceMappingURL=indication.module.js.map
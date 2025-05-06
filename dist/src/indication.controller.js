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
exports.IndicationController = void 0;
const common_1 = require("@nestjs/common");
const indication_service_1 = require("./indication.service");
const client_1 = require("@prisma/client");
let IndicationController = class IndicationController {
    indicationService;
    constructor(indicationService) {
        this.indicationService = indicationService;
    }
    create(createIndicationDto) {
        return this.indicationService.create(createIndicationDto);
    }
    findOne(id) {
        return this.indicationService.findOne(id);
    }
};
exports.IndicationController = IndicationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IndicationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IndicationController.prototype, "findOne", null);
exports.IndicationController = IndicationController = __decorate([
    (0, common_1.Controller)('indications'),
    __metadata("design:paramtypes", [indication_service_1.IndicationService])
], IndicationController);
//# sourceMappingURL=indication.controller.js.map
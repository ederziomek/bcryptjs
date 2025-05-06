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
var IntegrationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationController = void 0;
const common_1 = require("@nestjs/common");
const integration_service_1 = require("./integration.service");
let IntegrationController = IntegrationController_1 = class IntegrationController {
    integrationService;
    logger = new common_1.Logger(IntegrationController_1.name);
    constructor(integrationService) {
        this.integrationService = integrationService;
    }
    async handleUpbetRegistration(event) {
        this.logger.log(`Received UPBET Registration Event for user: ${event.userId}`);
        try {
            this.integrationService.handleUpbetRegistration(event).catch(err => {
                this.logger.error(`Error processing registration event for user ${event.userId}: ${err.message}`, err.stack);
            });
            return { message: 'Registration event received.' };
        }
        catch (error) {
            this.logger.error(`Error initiating registration event processing: ${error.message}`, error.stack);
            return { message: 'Registration event received, but initiation failed.' };
        }
    }
    async handleUpbetDeposit(event) {
        this.logger.log(`Received UPBET Deposit Event for user: ${event.userId}, Amount: ${event.amount}, First: ${event.isFirstDeposit}`);
        if (event.isFirstDeposit) {
            try {
                this.integrationService.handleUpbetFirstDeposit(event).catch(err => {
                    this.logger.error(`Error processing first deposit event for user ${event.userId}: ${err.message}`, err.stack);
                });
                return { message: 'First deposit event received.' };
            }
            catch (error) {
                this.logger.error(`Error initiating first deposit event processing: ${error.message}`, error.stack);
                return { message: 'First deposit event received, but initiation failed.' };
            }
        }
        else {
            this.logger.log(`Ignoring non-first deposit event for user: ${event.userId}`);
            return { message: 'Non-first deposit event received and ignored.' };
        }
    }
    async handleUpbetBet(event) {
        this.logger.log(`Received UPBET Bet Event for user: ${event.userId}, Bet ID: ${event.betId}`);
        try {
            this.integrationService.handleUpbetBet(event).catch(err => {
                this.logger.error(`Error processing bet event for user ${event.userId}: ${err.message}`, err.stack);
            });
            return { message: 'Bet event received.' };
        }
        catch (error) {
            this.logger.error(`Error initiating bet event processing: ${error.message}`, error.stack);
            return { message: 'Bet event received, but initiation failed.' };
        }
    }
    async handleUpbetGgr(event) {
        this.logger.log(`Received UPBET GGR Event for user: ${event.userId}, Amount: ${event.ggrAmount}`);
        try {
            this.integrationService.handleUpbetGgr(event).catch(err => {
                this.logger.error(`Error processing GGR event for user ${event.userId}: ${err.message}`, err.stack);
            });
            return { message: 'GGR event received.' };
        }
        catch (error) {
            this.logger.error(`Error initiating GGR event processing: ${error.message}`, error.stack);
            return { message: 'GGR event received, but initiation failed.' };
        }
    }
};
exports.IntegrationController = IntegrationController;
__decorate([
    (0, common_1.Post)('upbet/registration'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "handleUpbetRegistration", null);
__decorate([
    (0, common_1.Post)('upbet/deposit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "handleUpbetDeposit", null);
__decorate([
    (0, common_1.Post)('upbet/bet'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "handleUpbetBet", null);
__decorate([
    (0, common_1.Post)('upbet/ggr'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "handleUpbetGgr", null);
exports.IntegrationController = IntegrationController = IntegrationController_1 = __decorate([
    (0, common_1.Controller)('integration'),
    __metadata("design:paramtypes", [integration_service_1.IntegrationService])
], IntegrationController);
//# sourceMappingURL=integration.controller.js.map
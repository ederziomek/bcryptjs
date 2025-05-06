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
var NetworkService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
const client_1 = require("@prisma/client");
let NetworkService = NetworkService_1 = class NetworkService {
    prisma;
    logger = new common_1.Logger(NetworkService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUplineByReferral(referralIdentifier) {
        this.logger.log(`Attempting to find upline by referral identifier: ${referralIdentifier}`);
        try {
            const upline = await this.prisma.affiliate.findUnique({
                where: { id: referralIdentifier },
                select: { id: true }
            });
            if (upline) {
                this.logger.log(`Found upline affiliate ${upline.id} for identifier ${referralIdentifier}`);
                return upline.id;
            }
            else {
                this.logger.warn(`No affiliate found with ID matching referral identifier: ${referralIdentifier}`);
                return null;
            }
        }
        catch (error) {
            this.logger.error(`Error finding upline by referral identifier ${referralIdentifier}: ${error.message}`, error.stack);
            return null;
        }
    }
    async getDirectDownline(affiliateId) {
        this.logger.log(`Fetching direct downline for affiliate ${affiliateId}`);
        return this.prisma.affiliate.findMany({
            where: { uplineAffiliateId: affiliateId },
        });
    }
    async getDirectUpline(affiliateId) {
        this.logger.log(`Fetching direct upline for affiliate ${affiliateId}`);
        const affiliate = await this.prisma.affiliate.findUnique({
            where: { id: affiliateId },
            include: {
                upline: true,
            },
        });
        if (!affiliate) {
            throw new common_1.NotFoundException(`Affiliate ${affiliateId} not found.`);
        }
        return affiliate.upline;
    }
    async getFullDownline(affiliateId) {
        this.logger.log(`Fetching full downline for affiliate ${affiliateId}`);
        const query = client_1.Prisma.sql `
      WITH RECURSIVE DownlineHierarchy AS (
        -- Anchor member: Select the direct downlines
        SELECT id, "upbetUserId", level, status, "createdAt", "updatedAt", "uplineAffiliateId", 1 as depth
        FROM "Affiliate"
        WHERE "uplineAffiliateId" = ${affiliateId}

        UNION ALL

        -- Recursive member: Select downlines of the previous level
        SELECT aff.id, aff."upbetUserId", aff.level, aff.status, aff."createdAt", aff."updatedAt", aff."uplineAffiliateId", dh.depth + 1
        FROM "Affiliate" aff
        INNER JOIN DownlineHierarchy dh ON aff."uplineAffiliateId" = dh.id
        WHERE dh.depth < 10 -- Optional: Limit recursion depth to prevent infinite loops
      )
      SELECT id, "upbetUserId", level, status, "createdAt", "updatedAt", "uplineAffiliateId", depth
      FROM DownlineHierarchy;
    `;
        try {
            const downlines = await this.prisma.$queryRaw(query);
            return downlines;
        }
        catch (error) {
            this.logger.error(`Error fetching full downline for affiliate ${affiliateId}: ${error.message}`, error.stack);
            throw new Error(`Failed to fetch full downline for affiliate ${affiliateId}.`);
        }
    }
    async getUplineChain(affiliateId) {
        this.logger.log(`Fetching upline chain for affiliate ${affiliateId}`);
        const query = client_1.Prisma.sql `
      WITH RECURSIVE UplineHierarchy AS (
        -- Anchor member: Select the starting affiliate's direct upline
        SELECT id, "upbetUserId", level, status, "createdAt", "updatedAt", "uplineAffiliateId", 1 as level
        FROM "Affiliate"
        WHERE id = (SELECT "uplineAffiliateId" FROM "Affiliate" WHERE id = ${affiliateId})

        UNION ALL

        -- Recursive member: Select the upline of the previous level
        SELECT aff.id, aff."upbetUserId", aff.level, aff.status, aff."createdAt", aff."updatedAt", aff."uplineAffiliateId", uh.level + 1
        FROM "Affiliate" aff
        INNER JOIN UplineHierarchy uh ON aff.id = uh."uplineAffiliateId"
        WHERE uh."uplineAffiliateId" IS NOT NULL -- Stop when root is reached
          AND uh.level < 10 -- Optional: Limit recursion depth
      )
      SELECT id, "upbetUserId", level, status, "createdAt", "updatedAt", "uplineAffiliateId", level
      FROM UplineHierarchy
      ORDER BY level ASC; -- Order from direct upline upwards
    `;
        try {
            const uplines = await this.prisma.$queryRaw(query);
            return uplines;
        }
        catch (error) {
            this.logger.error(`Error fetching upline chain for affiliate ${affiliateId}: ${error.message}`, error.stack);
            throw new Error(`Failed to fetch upline chain for affiliate ${affiliateId}.`);
        }
    }
    async calculateAffiliateLevel(affiliateId) {
        this.logger.log(`Placeholder: Calculate level for affiliate ${affiliateId}`);
    }
};
exports.NetworkService = NetworkService;
exports.NetworkService = NetworkService = NetworkService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NetworkService);
//# sourceMappingURL=network.service.js.map
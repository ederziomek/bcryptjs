import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service'; // Corrected path
import { AffiliateService } from './affiliate.service'; // Corrected path
import { Affiliate, Prisma } from '@prisma/client';

@Injectable()
export class NetworkService {
  private readonly logger = new Logger(NetworkService.name);

  constructor(
    private prisma: PrismaService,
    // AffiliateService might not be needed directly here if we query Affiliate model
    // private affiliateService: AffiliateService,
  ) {}

  /**
   * Finds the upline affiliate ID based on a referral identifier.
   * Placeholder logic: Assumes identifier is the upline's affiliate ID.
   * Needs refinement based on actual referral mechanism.
   * @param referralIdentifier The identifier used during registration.
   * @returns The upline affiliate ID or null.
   */
  async findUplineByReferral(referralIdentifier: string): Promise<string | null> {
    this.logger.log(`Attempting to find upline by referral identifier: ${referralIdentifier}`);
    // Example: Assume referralIdentifier is the upline's ID for now
    // In reality, this might involve looking up a referral code table or similar
    try {
        const upline = await this.prisma.affiliate.findUnique({
            where: { id: referralIdentifier },
            select: { id: true } // Only select the ID
        });
        if (upline) {
            this.logger.log(`Found upline affiliate ${upline.id} for identifier ${referralIdentifier}`);
            return upline.id;
        } else {
            this.logger.warn(`No affiliate found with ID matching referral identifier: ${referralIdentifier}`);
            return null;
        }
    } catch (error) {
        // Handle cases where the identifier might not be a valid ID format
        this.logger.error(`Error finding upline by referral identifier ${referralIdentifier}: ${error.message}`, error.stack);
        return null;
    }
  }

  /**
   * Gets the direct downline (first level) for a given affiliate.
   * @param affiliateId The ID of the affiliate.
   * @returns An array of direct downline affiliates.
   */
  async getDirectDownline(affiliateId: string): Promise<Affiliate[]> {
    this.logger.log(`Fetching direct downline for affiliate ${affiliateId}`);
    return this.prisma.affiliate.findMany({
      where: { uplineAffiliateId: affiliateId },
      // Select fields as needed, avoid returning sensitive data if exposed via API
      // select: { id: true, upbetUserId: true, level: true, status: true, createdAt: true }
    });
  }

  /**
   * Gets the direct upline for a given affiliate.
   * @param affiliateId The ID of the affiliate.
   * @returns The direct upline affiliate or null if none exists.
   */
  async getDirectUpline(affiliateId: string): Promise<Affiliate | null> {
    this.logger.log(`Fetching direct upline for affiliate ${affiliateId}`);
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: {
        upline: true, // Include the upline relation
      },
    });
    if (!affiliate) {
        throw new NotFoundException(`Affiliate ${affiliateId} not found.`);
    }
    return affiliate.upline;
  }

  /**
   * Gets the complete downline (all levels) for a given affiliate using recursive CTE.
   * Requires raw SQL query.
   * @param affiliateId The ID of the root affiliate.
   * @returns An array of all downline affiliates.
   */
  async getFullDownline(affiliateId: string): Promise<Affiliate[]> {
    this.logger.log(`Fetching full downline for affiliate ${affiliateId}`);
    // Using Prisma's $queryRaw for recursive CTE
    const query = Prisma.sql`
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
      const downlines: Affiliate[] = await this.prisma.$queryRaw(query);
      return downlines;
    } catch (error) {
      this.logger.error(`Error fetching full downline for affiliate ${affiliateId}: ${error.message}`, error.stack);
      throw new Error(`Failed to fetch full downline for affiliate ${affiliateId}.`);
    }
  }

  /**
   * Gets the complete chain of uplines up to the root for a given affiliate.
   * Requires raw SQL query.
   * @param affiliateId The ID of the starting affiliate.
   * @returns An array of upline affiliates, ordered from direct upline to root.
   */
  async getUplineChain(affiliateId: string): Promise<Affiliate[]> {
    this.logger.log(`Fetching upline chain for affiliate ${affiliateId}`);
    const query = Prisma.sql`
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
      const uplines: Affiliate[] = await this.prisma.$queryRaw(query);
      return uplines;
    } catch (error) {
      this.logger.error(`Error fetching upline chain for affiliate ${affiliateId}: ${error.message}`, error.stack);
      throw new Error(`Failed to fetch upline chain for affiliate ${affiliateId}.`);
    }
  }

  // Placeholder for level calculation - might be complex depending on rules
  async calculateAffiliateLevel(affiliateId: string): Promise<void> {
    this.logger.log(`Placeholder: Calculate level for affiliate ${affiliateId}`);
    // Logic to determine level based on network size, performance, etc.
  }
}


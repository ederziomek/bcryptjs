import { Controller, Get, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { NetworkService } from '../network.service'; // Adjust path if needed
import { Affiliate } from '@prisma/client';
// Import guards later
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Basic DTO for pagination (can be enhanced)
class PaginationQueryDto {
  page?: number;
  limit?: number;
}

@Controller('network') // Base path for network-related endpoints
export class NetworkController {
  private readonly logger = new Logger(NetworkController.name);

  constructor(private readonly networkService: NetworkService) {}

  // --- Downline Endpoints ---

  // @UseGuards(JwtAuthGuard) // Add later
  @Get('affiliate/:affiliateId/downline/direct')
  async getDirectDownline(
    @Param('affiliateId') affiliateId: string,
    // @Request() req // Use req.user.id later
  ): Promise<Affiliate[]> {
    this.logger.log(`Fetching direct downline for affiliate ${affiliateId}`);
    // TODO: Add authorization check: is user allowed to see this affiliate's downline?
    return this.networkService.getDirectDownline(affiliateId);
  }

  // @UseGuards(JwtAuthGuard) // Add later
  @Get('affiliate/:affiliateId/downline/full')
  async getFullDownline(
    @Param('affiliateId') affiliateId: string,
    // @Request() req // Use req.user.id later
    // @Query() query: PaginationQueryDto, // Add pagination if needed for large networks
  ): Promise<Affiliate[]> {
    this.logger.log(`Fetching full downline for affiliate ${affiliateId}`);
    // TODO: Add authorization check
    // Note: Full downline query can be heavy. Consider pagination or depth limits.
    return this.networkService.getFullDownline(affiliateId);
  }

  // --- Upline Endpoints ---

  // @UseGuards(JwtAuthGuard) // Add later
  @Get('affiliate/:affiliateId/upline/direct')
  async getDirectUpline(
    @Param('affiliateId') affiliateId: string,
    // @Request() req // Use req.user.id later
  ): Promise<Affiliate | null> {
    this.logger.log(`Fetching direct upline for affiliate ${affiliateId}`);
    // TODO: Add authorization check
    return this.networkService.getDirectUpline(affiliateId);
  }

  // @UseGuards(JwtAuthGuard) // Add later
  @Get('affiliate/:affiliateId/upline/chain')
  async getUplineChain(
    @Param('affiliateId') affiliateId: string,
    // @Request() req // Use req.user.id later
  ): Promise<Affiliate[]> {
    this.logger.log(`Fetching upline chain for affiliate ${affiliateId}`);
    // TODO: Add authorization check
    return this.networkService.getUplineChain(affiliateId);
  }
}


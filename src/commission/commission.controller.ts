import { Controller, Get, Query, Param, UseGuards, Request, Logger } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { Commission, CommissionType } from '@prisma/client';
// Import authentication guards later if needed
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// DTO for query parameters (add validation later)
class FindCommissionsQueryDto {
  page?: number;
  limit?: number;
  type?: CommissionType;
  dateFrom?: string;
  dateTo?: string;
}

@Controller('commissions')
export class CommissionController {
  private readonly logger = new Logger(CommissionController.name);

  constructor(private readonly commissionService: CommissionService) {}

  // Endpoint to get commissions for the logged-in affiliate (or specific affiliate if admin)
  // For now, let's assume an endpoint to get commissions by affiliate ID
  // TODO: Add authentication and authorization
  @Get('affiliate/:affiliateId')
  // @UseGuards(JwtAuthGuard) // Add guard later
  async findCommissionsByAffiliate(
    @Param('affiliateId') affiliateId: string,
    @Query() query: FindCommissionsQueryDto,
    // @Request() req // Use req.user.id for logged-in affiliate later
  ): Promise<{ commissions: Commission[], total: number }> {
    this.logger.log(`Fetching commissions for affiliate ${affiliateId} with query: ${JSON.stringify(query)}`);

    // Basic pagination defaults
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;

    // TODO: Add proper validation for affiliateId and query params
    // For now, assume affiliateId comes from param, later use authenticated user
    const requestingAffiliateId = affiliateId; // Replace with req.user.id later

    return this.commissionService.findManyByAffiliate(requestingAffiliateId, {
      page,
      limit,
      type: query.type,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    });
  }

  // Maybe add an admin endpoint later to view all commissions
}


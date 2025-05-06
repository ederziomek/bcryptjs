import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { Prisma } from '@prisma/client';

@Controller('affiliates') // Using plural for resource endpoint
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  // Endpoint to create an affiliate (basic, might be handled by Integration later)
  @Post()
  create(@Body() createAffiliateDto: Prisma.AffiliateCreateInput) {
    // Basic validation/DTO can be added later
    return this.affiliateService.create(createAffiliateDto);
  }

  // Endpoint to get an affiliate by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.affiliateService.findOne(id);
  }

  // Add other endpoints (findAll, update, delete) later as needed
}


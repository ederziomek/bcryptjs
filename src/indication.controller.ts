import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IndicationService } from './indication.service';
import { Prisma } from '@prisma/client';

@Controller('indications') // Using plural for resource endpoint
export class IndicationController {
  constructor(private readonly indicationService: IndicationService) {}

  // Endpoint to create an indication (basic, might be handled by Integration later)
  @Post()
  create(@Body() createIndicationDto: Prisma.IndicationCreateInput) {
    // Basic validation/DTO can be added later
    return this.indicationService.create(createIndicationDto);
  }

  // Endpoint to get an indication by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.indicationService.findOne(id);
  }

  // Add other endpoints (findAll, update status) later as needed
}


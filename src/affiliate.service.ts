import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Affiliate, Prisma } from '@prisma/client';

@Injectable()
export class AffiliateService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AffiliateCreateInput): Promise<Affiliate> {
    // Basic creation logic. More complex logic like assigning upline based on link
    // or creating initial wallet will be added later.
    return this.prisma.affiliate.create({ data });
  }

  async findOne(id: string): Promise<Affiliate | null> {
    return this.prisma.affiliate.findUnique({ where: { id } });
  }

  async findByUpbetUserId(upbetUserId: string): Promise<Affiliate | null> {
    return this.prisma.affiliate.findUnique({ where: { upbetUserId } });
  }

  // Add findAll, update, delete methods later as needed
}


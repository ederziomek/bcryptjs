import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Decimal } from '@prisma/client/runtime/library'; // Import Decimal

// DTO for credit operation (example)
class CreditWalletDto {
  amount: string; // Use string to avoid precision issues
  description: string;
}

@Controller('wallets') // Using plural for resource endpoint
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // Endpoint to get wallet by affiliate ID
  @Get('affiliate/:affiliateId')
  findOneByAffiliateId(@Param('affiliateId') affiliateId: string) {
    return this.walletService.findOneByAffiliateId(affiliateId);
  }

  // Endpoint to credit a wallet (internal use or admin for now)
  @Post('affiliate/:affiliateId/credit')
  creditWallet(
    @Param('affiliateId') affiliateId: string,
    @Body() creditDto: CreditWalletDto,
  ) {
    // Convert amount string to Decimal before passing to service
    const amountDecimal = new Decimal(creditDto.amount);
    return this.walletService.credit(
      affiliateId,
      amountDecimal, // Pass Decimal type
      creditDto.description,
    );
  }

  // Add other endpoints (get balance, get transactions) later as needed
}


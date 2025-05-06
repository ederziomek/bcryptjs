import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { IntegrationService } from './integration.service';

// DTOs for UPBET Webhook Events
// TODO: Refine these DTOs based on actual payload structure from UPBET

interface UpbetRegistrationEventDto {
  userId: string; // ID of the new user on UPBET
  referralCode?: string; // Optional referral code/identifier used during registration
  timestamp: string; // ISO 8601 timestamp of the event
}

interface UpbetDepositEventDto {
  userId: string; // ID of the user on UPBET
  amount: number; // Amount deposited (use number, Prisma Decimal handles precision)
  transactionId: string; // Unique ID for the deposit transaction
  isFirstDeposit: boolean; // Flag indicating if this is the user's first deposit
  timestamp: string; // ISO 8601 timestamp of the event
}

interface UpbetBetEventDto {
  userId: string; // ID of the user on UPBET
  betId: string; // Unique ID for the bet
  amount: number; // Bet amount
  game: string; // Game identifier
  timestamp: string; // ISO 8601 timestamp of the event
}

interface UpbetGgrEventDto {
  userId: string; // ID of the user on UPBET
  ggrAmount: number; // Gross Gaming Revenue generated
  periodStart: string; // ISO 8601 timestamp for period start
  periodEnd: string; // ISO 8601 timestamp for period end
  timestamp: string; // ISO 8601 timestamp of the event generation
}

@Controller('integration') // Controller for handling external integrations
export class IntegrationController {
  private readonly logger = new Logger(IntegrationController.name);

  constructor(private readonly integrationService: IntegrationService) {}

  // Endpoint to receive registration events from UPBET (Webhook)
  @Post('upbet/registration')
  @HttpCode(HttpStatus.OK) // Respond with 200 OK
  async handleUpbetRegistration(@Body() event: UpbetRegistrationEventDto) {
    this.logger.log(`Received UPBET Registration Event for user: ${event.userId}`);
    // Basic validation can be added here (e.g., using class-validator)
    try {
      // Process the event asynchronously (fire-and-forget or queue later)
      this.integrationService.handleUpbetRegistration(event).catch(err => {
        this.logger.error(`Error processing registration event for user ${event.userId}: ${err.message}`, err.stack);
      });
      return { message: 'Registration event received.' };
    } catch (error) {
      this.logger.error(`Error initiating registration event processing: ${error.message}`, error.stack);
      // Still return OK to acknowledge receipt
      return { message: 'Registration event received, but initiation failed.' };
    }
  }

  // Endpoint to receive first deposit events from UPBET (Webhook)
  @Post('upbet/deposit')
  @HttpCode(HttpStatus.OK)
  async handleUpbetDeposit(@Body() event: UpbetDepositEventDto) {
    this.logger.log(`Received UPBET Deposit Event for user: ${event.userId}, Amount: ${event.amount}, First: ${event.isFirstDeposit}`);
    // We are particularly interested in the *first* deposit for CPA qualification
    if (event.isFirstDeposit) {
      try {
        // Process the event asynchronously
        this.integrationService.handleUpbetFirstDeposit(event).catch(err => {
          this.logger.error(`Error processing first deposit event for user ${event.userId}: ${err.message}`, err.stack);
        });
        return { message: 'First deposit event received.' };
      } catch (error) {
        this.logger.error(`Error initiating first deposit event processing: ${error.message}`, error.stack);
        return { message: 'First deposit event received, but initiation failed.' };
      }
    } else {
      // Ignore non-first deposits for now, or handle differently if needed later
      this.logger.log(`Ignoring non-first deposit event for user: ${event.userId}`);
      return { message: 'Non-first deposit event received and ignored.' };
    }
  }

  // Endpoint to receive bet events from UPBET (Webhook)
  @Post('upbet/bet')
  @HttpCode(HttpStatus.OK)
  async handleUpbetBet(@Body() event: UpbetBetEventDto) {
    this.logger.log(`Received UPBET Bet Event for user: ${event.userId}, Bet ID: ${event.betId}`);
    try {
      // Process the event asynchronously
      this.integrationService.handleUpbetBet(event).catch(err => {
        this.logger.error(`Error processing bet event for user ${event.userId}: ${err.message}`, err.stack);
      });
      return { message: 'Bet event received.' };
    } catch (error) {
      this.logger.error(`Error initiating bet event processing: ${error.message}`, error.stack);
      return { message: 'Bet event received, but initiation failed.' };
    }
  }

  // Endpoint to receive GGR events from UPBET (Webhook)
  @Post('upbet/ggr')
  @HttpCode(HttpStatus.OK)
  async handleUpbetGgr(@Body() event: UpbetGgrEventDto) {
    this.logger.log(`Received UPBET GGR Event for user: ${event.userId}, Amount: ${event.ggrAmount}`);
    try {
      // Process the event asynchronously
      this.integrationService.handleUpbetGgr(event).catch(err => {
        this.logger.error(`Error processing GGR event for user ${event.userId}: ${err.message}`, err.stack);
      });
      return { message: 'GGR event received.' };
    } catch (error) {
      this.logger.error(`Error initiating GGR event processing: ${error.message}`, error.stack);
      return { message: 'GGR event received, but initiation failed.' };
    }
  }
}


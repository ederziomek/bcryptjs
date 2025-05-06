import { PrismaClient, AffiliateLevel, AffiliateStatus, IndicationStatus, CommissionType, TransactionType, CpaQualificationRule } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library'; // Import Decimal

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- Clean up existing data (optional, good for repeatable seeds) ---
  await prisma.walletTransaction.deleteMany({});
  await prisma.commission.deleteMany({});
  await prisma.indication.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.affiliate.deleteMany({});
  console.log('Deleted existing data.');

  // --- Create Affiliates ---
  const affiliate1 = await prisma.affiliate.create({
    data: {
      upbetUserId: 'user_upbet_101',
      level: AffiliateLevel.GOLD,
      status: AffiliateStatus.ACTIVE,
      // No upline for the first affiliate
    },
  });

  const affiliate2 = await prisma.affiliate.create({
    data: {
      upbetUserId: 'user_upbet_102',
      level: AffiliateLevel.SILVER,
      status: AffiliateStatus.ACTIVE,
      uplineAffiliateId: affiliate1.id, // affiliate1 is the upline
    },
  });

  const affiliate3 = await prisma.affiliate.create({
    data: {
      upbetUserId: 'user_upbet_103',
      level: AffiliateLevel.BRONZE,
      status: AffiliateStatus.INACTIVE,
      uplineAffiliateId: affiliate1.id, // affiliate1 is the upline
    },
  });

  const affiliate4 = await prisma.affiliate.create({
      data: {
        upbetUserId: 'user_upbet_104',
        level: AffiliateLevel.BRONZE,
        status: AffiliateStatus.ACTIVE,
        uplineAffiliateId: affiliate2.id, // affiliate2 is the upline
      },
    });

  console.log(`Created affiliates: ${affiliate1.id}, ${affiliate2.id}, ${affiliate3.id}, ${affiliate4.id}`);

  // --- Create Wallets ---
  const wallet1 = await prisma.wallet.create({
    data: {
      affiliateId: affiliate1.id,
      balance: new Decimal('155.75'),
    },
  });

  const wallet2 = await prisma.wallet.create({
    data: {
      affiliateId: affiliate2.id,
      balance: new Decimal('42.50'),
    },
  });

  const wallet3 = await prisma.wallet.create({
    data: {
      affiliateId: affiliate3.id,
      balance: new Decimal('5.00'),
    },
  });

  const wallet4 = await prisma.wallet.create({
      data: {
        affiliateId: affiliate4.id,
        balance: new Decimal('10.00'),
      },
    });

  console.log(`Created wallets for affiliates.`);

  // --- Create Indications ---
  // Indication 1: Validated (by affiliate2)
  const indication1 = await prisma.indication.create({
    data: {
      indicatedUserId: 'indicated_user_201',
      affiliateId: affiliate2.id,
      status: IndicationStatus.VALIDATED,
      firstDepositAmount: new Decimal('50.00'),
      firstDepositAt: new Date(),
      betCount: 15,
      totalGgr: new Decimal('25.00'),
    },
  });

  // Indication 2: Pending Validation (by affiliate2)
  const indication2 = await prisma.indication.create({
    data: {
      indicatedUserId: 'indicated_user_202',
      affiliateId: affiliate2.id,
      status: IndicationStatus.PENDING_VALIDATION,
      firstDepositAmount: new Decimal('35.00'),
      firstDepositAt: new Date(),
      betCount: 5,
      totalGgr: new Decimal('10.00'),
    },
  });

  // Indication 3: Pending KYC (by affiliate1)
  const indication3 = await prisma.indication.create({
    data: {
      indicatedUserId: 'indicated_user_203',
      affiliateId: affiliate1.id,
      status: IndicationStatus.PENDING_KYC,
    },
  });

  // Indication 4: Validated (by affiliate4)
  const indication4 = await prisma.indication.create({
      data: {
        indicatedUserId: 'indicated_user_204',
        affiliateId: affiliate4.id,
        status: IndicationStatus.VALIDATED,
        firstDepositAmount: new Decimal('100.00'),
        firstDepositAt: new Date(),
        betCount: 20,
        totalGgr: new Decimal('40.00'),
      },
    });

  console.log(`Created indications.`);

  // --- Create Commissions (linked to indications where applicable) ---
  // CPA Commission for indication1 (paid to affiliate2 and upline)
  // Assuming CPA distribution: L1=35, L2=10, L3=5, L4=5, L5=5
  const commission_cpa_l1 = await prisma.commission.create({
    data: {
      amount: new Decimal('35.00'),
      type: CommissionType.CPA,
      recipientAffiliateId: affiliate2.id, // Direct referrer
      sourceIndicationId: indication1.id,
    },
  });

  const commission_cpa_l2 = await prisma.commission.create({
    data: {
      amount: new Decimal('10.00'),
      type: CommissionType.CPA,
      recipientAffiliateId: affiliate1.id, // Upline of affiliate2
      sourceIndicationId: indication1.id, // Link to the same source indication
    },
  });

  // CPA Commission for indication4 (paid to affiliate4 and upline)
  const commission_cpa_l1_ind4 = await prisma.commission.create({
      data: {
        amount: new Decimal('35.00'),
        type: CommissionType.CPA,
        recipientAffiliateId: affiliate4.id, // Direct referrer
        sourceIndicationId: indication4.id,
      },
    });

  const commission_cpa_l2_ind4 = await prisma.commission.create({
      data: {
        amount: new Decimal('10.00'),
        type: CommissionType.CPA,
        recipientAffiliateId: affiliate2.id, // Upline of affiliate4
        sourceIndicationId: indication4.id,
      },
    });

  const commission_cpa_l3_ind4 = await prisma.commission.create({
      data: {
        amount: new Decimal('5.00'),
        type: CommissionType.CPA,
        recipientAffiliateId: affiliate1.id, // Upline of affiliate2
        sourceIndicationId: indication4.id,
      },
    });


  // RevShare Commission example (paid to affiliate1)
  const commission_revshare = await prisma.commission.create({
    data: {
      amount: new Decimal('15.75'),
      type: CommissionType.REVSHARE,
      recipientAffiliateId: affiliate1.id,
      // sourceIndicationId is null for RevShare aggregated over a period
    },
  });

  // Level Up Reward example (paid to affiliate2)
  const commission_levelup = await prisma.commission.create({
    data: {
      amount: new Decimal('50.00'), // Example value
      type: CommissionType.LEVEL_UP_REWARD,
      recipientAffiliateId: affiliate2.id,
    },
  });

  console.log(`Created commissions.`);

  // --- Create Wallet Transactions (linking to commissions using connect) ---
  await prisma.walletTransaction.create({
    data: {
      amount: commission_cpa_l1.amount,
      type: TransactionType.CREDIT,
      description: `CPA Commission from indication ${indication1.indicatedUserId}`,
      walletId: wallet2.id,
      commission: { connect: { id: commission_cpa_l1.id } }, // Corrected: Use connect
    },
  });

  await prisma.walletTransaction.create({
    data: {
      amount: commission_cpa_l2.amount,
      type: TransactionType.CREDIT,
      description: `CPA Uplvl Commission from indication ${indication1.indicatedUserId}`,
      walletId: wallet1.id,
      commission: { connect: { id: commission_cpa_l2.id } }, // Corrected: Use connect
    },
  });

  await prisma.walletTransaction.create({
      data: {
        amount: commission_cpa_l1_ind4.amount,
        type: TransactionType.CREDIT,
        description: `CPA Commission from indication ${indication4.indicatedUserId}`,
        walletId: wallet4.id,
        commission: { connect: { id: commission_cpa_l1_ind4.id } }, // Corrected: Use connect
      },
    });

  await prisma.walletTransaction.create({
      data: {
        amount: commission_cpa_l2_ind4.amount,
        type: TransactionType.CREDIT,
        description: `CPA Uplvl2 Commission from indication ${indication4.indicatedUserId}`,
        walletId: wallet2.id,
        commission: { connect: { id: commission_cpa_l2_ind4.id } }, // Corrected: Use connect
      },
    });

  await prisma.walletTransaction.create({
      data: {
        amount: commission_cpa_l3_ind4.amount,
        type: TransactionType.CREDIT,
        description: `CPA Uplvl3 Commission from indication ${indication4.indicatedUserId}`,
        walletId: wallet1.id,
        commission: { connect: { id: commission_cpa_l3_ind4.id } }, // Corrected: Use connect
      },
    });

  await prisma.walletTransaction.create({
    data: {
      amount: commission_revshare.amount,
      type: TransactionType.CREDIT,
      description: 'Weekly RevShare Payout',
      walletId: wallet1.id,
      commission: { connect: { id: commission_revshare.id } }, // Corrected: Use connect
    },
  });

  await prisma.walletTransaction.create({
    data: {
      amount: commission_levelup.amount,
      type: TransactionType.CREDIT,
      description: 'Level Up Reward (Silver)',
      walletId: wallet2.id,
      commission: { connect: { id: commission_levelup.id } }, // Corrected: Use connect
    },
  });

  // Example Debit Transaction (Withdrawal)
  await prisma.walletTransaction.create({
    data: {
      amount: new Decimal('100.00'),
      type: TransactionType.DEBIT,
      description: 'Withdrawal Request #W123',
      walletId: wallet1.id,
      // No commission linked to a withdrawal
    },
  });

  console.log(`Created wallet transactions.`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


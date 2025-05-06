"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log(`Start seeding ...`);
    await prisma.walletTransaction.deleteMany({});
    await prisma.commission.deleteMany({});
    await prisma.indication.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.affiliate.deleteMany({});
    console.log('Deleted existing data.');
    const affiliate1 = await prisma.affiliate.create({
        data: {
            upbetUserId: 'user_upbet_101',
            level: client_1.AffiliateLevel.GOLD,
            status: client_1.AffiliateStatus.ACTIVE,
        },
    });
    const affiliate2 = await prisma.affiliate.create({
        data: {
            upbetUserId: 'user_upbet_102',
            level: client_1.AffiliateLevel.SILVER,
            status: client_1.AffiliateStatus.ACTIVE,
            uplineAffiliateId: affiliate1.id,
        },
    });
    const affiliate3 = await prisma.affiliate.create({
        data: {
            upbetUserId: 'user_upbet_103',
            level: client_1.AffiliateLevel.BRONZE,
            status: client_1.AffiliateStatus.INACTIVE,
            uplineAffiliateId: affiliate1.id,
        },
    });
    const affiliate4 = await prisma.affiliate.create({
        data: {
            upbetUserId: 'user_upbet_104',
            level: client_1.AffiliateLevel.BRONZE,
            status: client_1.AffiliateStatus.ACTIVE,
            uplineAffiliateId: affiliate2.id,
        },
    });
    console.log(`Created affiliates: ${affiliate1.id}, ${affiliate2.id}, ${affiliate3.id}, ${affiliate4.id}`);
    const wallet1 = await prisma.wallet.create({
        data: {
            affiliateId: affiliate1.id,
            balance: new library_1.Decimal('155.75'),
        },
    });
    const wallet2 = await prisma.wallet.create({
        data: {
            affiliateId: affiliate2.id,
            balance: new library_1.Decimal('42.50'),
        },
    });
    const wallet3 = await prisma.wallet.create({
        data: {
            affiliateId: affiliate3.id,
            balance: new library_1.Decimal('5.00'),
        },
    });
    const wallet4 = await prisma.wallet.create({
        data: {
            affiliateId: affiliate4.id,
            balance: new library_1.Decimal('10.00'),
        },
    });
    console.log(`Created wallets for affiliates.`);
    const indication1 = await prisma.indication.create({
        data: {
            indicatedUserId: 'indicated_user_201',
            affiliateId: affiliate2.id,
            status: client_1.IndicationStatus.VALIDATED,
            firstDepositAmount: new library_1.Decimal('50.00'),
            firstDepositAt: new Date(),
            betCount: 15,
            totalGgr: new library_1.Decimal('25.00'),
        },
    });
    const indication2 = await prisma.indication.create({
        data: {
            indicatedUserId: 'indicated_user_202',
            affiliateId: affiliate2.id,
            status: client_1.IndicationStatus.PENDING_VALIDATION,
            firstDepositAmount: new library_1.Decimal('35.00'),
            firstDepositAt: new Date(),
            betCount: 5,
            totalGgr: new library_1.Decimal('10.00'),
        },
    });
    const indication3 = await prisma.indication.create({
        data: {
            indicatedUserId: 'indicated_user_203',
            affiliateId: affiliate1.id,
            status: client_1.IndicationStatus.PENDING_KYC,
        },
    });
    const indication4 = await prisma.indication.create({
        data: {
            indicatedUserId: 'indicated_user_204',
            affiliateId: affiliate4.id,
            status: client_1.IndicationStatus.VALIDATED,
            firstDepositAmount: new library_1.Decimal('100.00'),
            firstDepositAt: new Date(),
            betCount: 20,
            totalGgr: new library_1.Decimal('40.00'),
        },
    });
    console.log(`Created indications.`);
    const commission_cpa_l1 = await prisma.commission.create({
        data: {
            amount: new library_1.Decimal('35.00'),
            type: client_1.CommissionType.CPA,
            recipientAffiliateId: affiliate2.id,
            sourceIndicationId: indication1.id,
        },
    });
    const commission_cpa_l2 = await prisma.commission.create({
        data: {
            amount: new library_1.Decimal('10.00'),
            type: client_1.CommissionType.CPA,
            recipientAffiliateId: affiliate1.id,
            sourceIndicationId: indication1.id,
        },
    });
    const commission_cpa_l1_ind4 = await prisma.commission.create({
        data: {
            amount: new library_1.Decimal('35.00'),
            type: client_1.CommissionType.CPA,
            recipientAffiliateId: affiliate4.id,
            sourceIndicationId: indication4.id,
        },
    });
    const commission_cpa_l2_ind4 = await prisma.commission.create({
        data: {
            amount: new library_1.Decimal('10.00'),
            type: client_1.CommissionType.CPA,
            recipientAffiliateId: affiliate2.id,
            sourceIndicationId: indication4.id,
        },
    });
    const commission_cpa_l3_ind4 = await prisma.commission.create({
        data: {
            amount: new library_1.Decimal('5.00'),
            type: client_1.CommissionType.CPA,
            recipientAffiliateId: affiliate1.id,
            sourceIndicationId: indication4.id,
        },
    });
    const commission_revshare = await prisma.commission.create({
        data: {
            amount: new library_1.Decimal('15.75'),
            type: client_1.CommissionType.REVSHARE,
            recipientAffiliateId: affiliate1.id,
        },
    });
    const commission_levelup = await prisma.commission.create({
        data: {
            amount: new library_1.Decimal('50.00'),
            type: client_1.CommissionType.LEVEL_UP_REWARD,
            recipientAffiliateId: affiliate2.id,
        },
    });
    console.log(`Created commissions.`);
    await prisma.walletTransaction.create({
        data: {
            amount: commission_cpa_l1.amount,
            type: client_1.TransactionType.CREDIT,
            description: `CPA Commission from indication ${indication1.indicatedUserId}`,
            walletId: wallet2.id,
            commission: { connect: { id: commission_cpa_l1.id } },
        },
    });
    await prisma.walletTransaction.create({
        data: {
            amount: commission_cpa_l2.amount,
            type: client_1.TransactionType.CREDIT,
            description: `CPA Uplvl Commission from indication ${indication1.indicatedUserId}`,
            walletId: wallet1.id,
            commission: { connect: { id: commission_cpa_l2.id } },
        },
    });
    await prisma.walletTransaction.create({
        data: {
            amount: commission_cpa_l1_ind4.amount,
            type: client_1.TransactionType.CREDIT,
            description: `CPA Commission from indication ${indication4.indicatedUserId}`,
            walletId: wallet4.id,
            commission: { connect: { id: commission_cpa_l1_ind4.id } },
        },
    });
    await prisma.walletTransaction.create({
        data: {
            amount: commission_cpa_l2_ind4.amount,
            type: client_1.TransactionType.CREDIT,
            description: `CPA Uplvl2 Commission from indication ${indication4.indicatedUserId}`,
            walletId: wallet2.id,
            commission: { connect: { id: commission_cpa_l2_ind4.id } },
        },
    });
    await prisma.walletTransaction.create({
        data: {
            amount: commission_cpa_l3_ind4.amount,
            type: client_1.TransactionType.CREDIT,
            description: `CPA Uplvl3 Commission from indication ${indication4.indicatedUserId}`,
            walletId: wallet1.id,
            commission: { connect: { id: commission_cpa_l3_ind4.id } },
        },
    });
    await prisma.walletTransaction.create({
        data: {
            amount: commission_revshare.amount,
            type: client_1.TransactionType.CREDIT,
            description: 'Weekly RevShare Payout',
            walletId: wallet1.id,
            commission: { connect: { id: commission_revshare.id } },
        },
    });
    await prisma.walletTransaction.create({
        data: {
            amount: commission_levelup.amount,
            type: client_1.TransactionType.CREDIT,
            description: 'Level Up Reward (Silver)',
            walletId: wallet2.id,
            commission: { connect: { id: commission_levelup.id } },
        },
    });
    await prisma.walletTransaction.create({
        data: {
            amount: new library_1.Decimal('100.00'),
            type: client_1.TransactionType.DEBIT,
            description: 'Withdrawal Request #W123',
            walletId: wallet1.id,
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
//# sourceMappingURL=seed.js.map
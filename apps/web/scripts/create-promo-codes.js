const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPromoCodes() {
  try {
    // Create a test promo code for free license
    const freePromo = await prisma.promoCode.create({
      data: {
        code: 'TESTFREE',
        description: 'Test promo code for free license',
        discountType: 'free',
        discountValue: 0,
        maxUses: 10,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Create a 50% off promo code
    const halfOffPromo = await prisma.promoCode.create({
      data: {
        code: 'HALFOFF',
        description: '50% off your first license',
        discountType: 'percentage',
        discountValue: 50,
        maxUses: 100,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Create a $10 off promo code
    const tenOffPromo = await prisma.promoCode.create({
      data: {
        code: 'SAVE10',
        description: '$10 off your purchase',
        discountType: 'fixed',
        discountValue: 1000, // $10 in cents
        maxUses: 50,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    console.log('Promo codes created successfully:');
    console.log('1. TESTFREE - Free license (max 10 uses)');
    console.log('2. HALFOFF - 50% off (max 100 uses)');
    console.log('3. SAVE10 - $10 off (max 50 uses)');
    console.log('\nYou can now use these codes for testing!');

  } catch (error) {
    console.error('Error creating promo codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPromoCodes();

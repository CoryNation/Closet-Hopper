const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdditionalLicensePromo() {
  try {
    // Create a promo code for additional license discount (40% off)
    const additionalPromo = await prisma.promoCode.create({
      data: {
        code: 'ADDITIONAL40',
        description: '40% off additional licenses for existing customers',
        discountType: 'percentage',
        discountValue: 40,
        maxUses: 1000, // High limit for existing customers
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    });

    console.log('Additional license promo code created successfully:');
    console.log('ADDITIONAL40 - 40% off additional licenses (max 1000 uses)');
    console.log('\nThis code will be automatically applied to additional license purchases!');

  } catch (error) {
    console.error('Error creating additional license promo code:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdditionalLicensePromo();

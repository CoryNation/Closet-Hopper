const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupLicenses() {
  try {
    console.log('Starting license cleanup...');
    
    // Delete promo code usages first (foreign key constraint)
    const deletedUsages = await prisma.promoCodeUsage.deleteMany({
      where: {
        licenseId: {
          not: null
        }
      }
    });
    console.log(`Deleted ${deletedUsages.count} promo code usages`);
    
    // Delete activations
    const deletedActivations = await prisma.activation.deleteMany();
    console.log(`Deleted ${deletedActivations.count} activations`);
    
    // Delete all licenses
    const deletedLicenses = await prisma.license.deleteMany();
    console.log(`Deleted ${deletedLicenses.count} licenses`);
    
    console.log('✅ License cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupLicenses();

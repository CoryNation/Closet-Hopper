import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import crypto from 'crypto';

function generateLicenseKey(): string {
  // Generate a human-friendly license key: XXXX-XXXX-XXXX-XXXX
  const bytes = crypto.randomBytes(8);
  const hex = bytes.toString('hex').toUpperCase();
  return hex.match(/.{1,4}/g)!.join('-');
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { licenseType, stripeSessionId, promoCodeId } = await req.json();

    if (!licenseType) {
      return NextResponse.json({ error: 'License type is required' }, { status: 400 });
    }

    // Check if license already exists for this session
    if (stripeSessionId) {
      const existingLicense = await prisma.license.findFirst({
        where: { stripeSessionId }
      });

      if (existingLicense) {
        return NextResponse.json({ 
          error: 'License already exists for this session',
          license: existingLicense 
        }, { status: 400 });
      }
    }

    // Generate license key
    const licenseKey = generateLicenseKey();

    // Create license in database
    const license = await prisma.license.create({
      data: {
        key: licenseKey,
        plan: licenseType,
        status: 'available',
        userId: payload.id,
        stripeSessionId: stripeSessionId || null,
      },
    });

    // Handle promo code usage if applicable
    if (promoCodeId) {
      await prisma.promoCodeUsage.create({
        data: {
          promoCodeId,
          userId: payload.id,
          licenseId: license.id,
        },
      });

      // Update promo code usage count
      await prisma.promoCode.update({
        where: { id: promoCodeId },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    console.log('Manual license created:', {
      id: license.id,
      key: licenseKey,
      type: licenseType,
      userId: payload.id,
    });

    return NextResponse.json({ 
      success: true, 
      license: {
        id: license.id,
        key: license.key,
        plan: license.plan,
        status: license.status,
        createdAt: license.createdAt
      }
    });

  } catch (error) {
    console.error('Manual license creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create license' },
      { status: 500 }
    );
  }
}

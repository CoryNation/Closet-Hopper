import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { licenseId, recipientEmail, message } = await req.json();

    // Validate input
    if (!licenseId || !recipientEmail) {
      return NextResponse.json(
        { error: 'License ID and recipient email are required' },
        { status: 400 }
      );
    }

    // Check if license exists and belongs to the user
    const license = await prisma.license.findFirst({
      where: {
        id: licenseId,
        userId: payload.id,
        status: 'available'
      }
    });

    if (!license) {
      return NextResponse.json(
        { error: 'License not found or not available for transfer' },
        { status: 404 }
      );
    }

    // Update license to be a gift
    const updatedLicense = await prisma.license.update({
      where: { id: licenseId },
      data: {
        isGift: true,
        giftRecipientEmail: recipientEmail,
        giftMessage: message || null
      }
    });

    // TODO: Send email notification to recipient
    // This would typically send an email with the license key and instructions

    return NextResponse.json({
      success: true,
      license: updatedLicense
    });

  } catch (error) {
    console.error('License transfer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

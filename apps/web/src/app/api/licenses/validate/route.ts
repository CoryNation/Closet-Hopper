import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { key, profileHash } = await req.json();
    
    if (!key || !profileHash) {
      return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
    }

    // Find the license in the database
    const license = await prisma.license.findUnique({
      where: { key },
      include: {
        activations: true,
        user: true,
      },
    });

    if (!license) {
      return NextResponse.json({ ok: false, error: "invalid_key" }, { status: 404 });
    }

    if (license.status !== 'active') {
      return NextResponse.json({ ok: false, error: "license_revoked" }, { status: 403 });
    }

    // Check if this profile is already activated
    const existingActivation = license.activations.find(
      activation => activation.profileHash === profileHash
    );

    if (existingActivation) {
      // Update last check time
      await prisma.activation.update({
        where: { id: existingActivation.id },
        data: { lastCheckAt: new Date() },
      });

      return NextResponse.json({ 
        ok: true, 
        status: "active", 
        plan: license.plan, 
        seats: { used: license.activations.length, max: 1 }, 
        bound: true, 
        nextCheckInDays: 14 
      });
    }

    // Check if license has available seats (max 1 for now)
    if (license.activations.length >= 1) {
      return NextResponse.json({ ok: false, error: "license_full" }, { status: 403 });
    }

    // License is valid but not yet bound to this profile
    return NextResponse.json({ 
      ok: true, 
      status: "active", 
      plan: license.plan, 
      seats: { used: license.activations.length, max: 1 }, 
      bound: false, 
      nextCheckInDays: 14 
    });
    
  } catch (error) {
    console.error('License validation error:', error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

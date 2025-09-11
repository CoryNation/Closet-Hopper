import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { key, profileHash, email } = await req.json();
    
    if (!key || !profileHash) {
      return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
    }

    // Find the license in the database
    const license = await prisma.license.findUnique({
      where: { key },
      include: {
        activations: true,
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
      return NextResponse.json({ ok: true, message: "already_activated" });
    }

    // Check if license has available seats (max 1 for now)
    if (license.activations.length >= 1) {
      return NextResponse.json({ ok: false, error: "license_full" }, { status: 403 });
    }

    // Create new activation
    await prisma.activation.create({
      data: {
        licenseId: license.id,
        profileHash,
      },
    });

    return NextResponse.json({ ok: true, message: "activated" });
    
  } catch (error) {
    console.error('License activation error:', error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

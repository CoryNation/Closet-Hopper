import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(req: NextRequest, secret: string) {
  // Implement provider-specific check (LS: X-Signature; Gumroad: payload signature)
  // For now, return true - implement proper verification in production
  return true;
}

function generateKey() {
  // Human-friendly license: 4x4 uppercase blocks
  return crypto.randomBytes(8).toString("hex").toUpperCase().match(/.{1,4}/g)!.join("-");
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const secret = process.env.WEBHOOK_SECRET!;
    
    if (!verifySignature(req, secret)) {
      return new NextResponse("invalid signature", { status: 401 });
    }

    // For now, return a mock response since database isn't set up yet
    // TODO: Implement actual database logic when database is configured
    const key = generateKey();
    console.log('Generated license key:', key);

    return NextResponse.json({ ok: true, key });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

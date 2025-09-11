import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { key, profileHash } = await req.json();
    
    // For now, return a mock response since database isn't set up yet
    // TODO: Implement actual database logic when database is configured
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('License ping error:', error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

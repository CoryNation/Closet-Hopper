import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Test webhook received:', body);
    
    return NextResponse.json({ 
      received: true, 
      timestamp: new Date().toISOString(),
      body 
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Test webhook failed' },
      { status: 500 }
    );
  }
}

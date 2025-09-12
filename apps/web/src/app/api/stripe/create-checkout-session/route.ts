import { NextRequest, NextResponse } from "next/server";
import Stripe from 'stripe';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const { priceId, licenseType, promoCodeId, successUrl, cancelUrl } = await req.json();

    if (!priceId || !licenseType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Get user from authentication
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get promo code details if provided
    let promoCode = null;
    if (promoCodeId) {
      promoCode = await prisma.promoCode.findUnique({
        where: { id: promoCodeId }
      });
      
      if (!promoCode) {
        return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: payload.email,
      metadata: {
        licenseType,
        userId: payload.id,
        promoCodeId: promoCodeId || '',
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

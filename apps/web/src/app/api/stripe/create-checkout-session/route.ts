import { NextRequest, NextResponse } from "next/server";
import Stripe from 'stripe';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { licenseType, promoCodeId, successUrl, cancelUrl } = body;

    if (!licenseType) {
      console.error('Missing licenseType parameter');
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Get user from authentication
    const token = getTokenFromRequest(req);
    if (!token) {
      console.error('No authentication token provided');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      console.error('Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get promo code details if provided
    let promoCode = null;
    if (promoCodeId) {
      try {
        promoCode = await prisma.promoCode.findUnique({
          where: { id: promoCodeId }
        });
        
        if (!promoCode) {
          console.error('Promo code not found:', promoCodeId);
          return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
        }
        
      } catch (error) {
        console.error('Error fetching promo code:', error);
        return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 });
      }
    }

    // Calculate pricing
    const basePrice = licenseType === 'first' ? 5700 : 3400 // in cents
    let finalPrice = basePrice
    let discountAmount = 0

    if (promoCode) {
      if (promoCode.discountType === 'free') {
        finalPrice = 0
        discountAmount = basePrice
      } else if (promoCode.discountType === 'percentage') {
        discountAmount = Math.round(basePrice * (promoCode.discountValue / 100))
        finalPrice = basePrice - discountAmount
      } else if (promoCode.discountType === 'fixed') {
        discountAmount = promoCode.discountValue
        finalPrice = Math.max(0, basePrice - discountAmount)
      }
    }

    // Create line items - show original price and discount separately
    const lineItems: any[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: licenseType === 'first' ? 'Closet Hopper License' : 'Additional Closet Hopper License',
            description: 'One-time payment for lifetime access',
          },
          unit_amount: basePrice, // Always show original price
        },
        quantity: 1,
      },
    ]

    // For free items, create a $0 line item
    if (finalPrice === 0) {
      lineItems[0].price_data.unit_amount = 0;
      lineItems[0].price_data.product_data.description = `Free with ${promoCode?.code} promo code`;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: payload.email,
      metadata: {
        licenseType,
        userId: payload.id,
        promoCodeId: promoCodeId || '',
        originalPrice: basePrice.toString(),
        finalPrice: finalPrice.toString(),
        discountAmount: discountAmount.toString(),
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

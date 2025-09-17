import { NextRequest, NextResponse } from "next/server";
import Stripe from 'stripe';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const { licenseType, userId, promoCodeId } = session.metadata!;
    
    console.log('Webhook received checkout completion:', {
      sessionId: session.id,
      licenseType,
      userId,
      promoCodeId,
      customerEmail: session.customer_email
    });
    
    // Check if license already exists for this session (idempotency)
    const existingLicense = await prisma.license.findFirst({
      where: { stripeSessionId: session.id }
    });
    
    if (existingLicense) {
      console.log('License already exists for session:', session.id);
      return;
    }
    
    // Generate license key
    const licenseKey = generateLicenseKey();
    
    // Find user by userId from metadata (more reliable than email)
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    }
    
    // Fallback to email if userId not found
    if (!user && session.customer_email) {
      user = await prisma.user.findUnique({
        where: { email: session.customer_email },
      });
    }
    
    if (!user) {
      console.error('User not found for checkout session:', session.id);
      return;
    }
    
    // Create license in database with 'active' status
    const license = await prisma.license.create({
      data: {
        key: licenseKey,
        plan: licenseType || 'first',
        status: 'active', // Changed from 'available' to 'active'
        userId: user?.id,
        stripePaymentIntentId: session.payment_intent as string,
        stripeSessionId: session.id,
      },
    });

    // Handle promo code usage if applicable
    if (promoCodeId && user?.id) {
      await prisma.promoCodeUsage.create({
        data: {
          promoCodeId,
          userId: user.id,
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

    console.log('License created:', {
      id: license.id,
      key: licenseKey,
      type: licenseType,
      email: session.customer_email,
      userId: user?.id,
    });

  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

function generateLicenseKey(): string {
  // Generate a human-friendly license key: XXXX-XXXX-XXXX-XXXX
  const bytes = crypto.randomBytes(8);
  const hex = bytes.toString('hex').toUpperCase();
  return hex.match(/.{1,4}/g)!.join('-');
}

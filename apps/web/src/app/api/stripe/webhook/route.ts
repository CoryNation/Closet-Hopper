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
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
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
    
    // Generate license key
    const licenseKey = generateLicenseKey();
    
    // Find user by email (don't create new users here)
    let user = null;
    if (session.customer_email) {
      user = await prisma.user.findUnique({
        where: { email: session.customer_email },
      });
    }
    
    // Create license in database
    const license = await prisma.license.create({
      data: {
        key: licenseKey,
        plan: licenseType || 'first',
        status: 'available',
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

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Handle successful payment
  console.log('Payment succeeded:', paymentIntent.id);
}

function generateLicenseKey(): string {
  // Generate a human-friendly license key: XXXX-XXXX-XXXX-XXXX
  const bytes = crypto.randomBytes(8);
  const hex = bytes.toString('hex').toUpperCase();
  return hex.match(/.{1,4}/g)!.join('-');
}

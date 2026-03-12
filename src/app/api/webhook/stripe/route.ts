import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-02-25.clover',
});

// Stripe requires the raw body to construct the event
export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        // Obtains the webhook secret from the environment variables
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (webhookSecret) {
            // Verify event signature if secret is provided
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } else {
            // If no secret is provided, parse the event directly (NOT safe for production)
            console.warn('⚠️ No STRIPE_WEBHOOK_SECRET provided. Signature verification skipped.');
            event = JSON.parse(body);
        }
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Pass the relevant event data to the n8n webhook
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        try {
            // Send exactly what n8n expects, or pass the whole event object
            await fetch('https://n8n.growbeyond.cz/webhook/05b71734-3a21-4569-85a6-55434c3c596a/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: event.type,
                    data: session,
                    // Optionally fetch customer details if needed:
                    // customer: session.customer_details
                }),
            });
            console.log('✅ Successfully forwarded checkout.session.completed to n8n');
        } catch (forwardError) {
            console.error('❌ Failed to forward to n8n webhook:', forwardError);
            return NextResponse.json(
                { error: 'Failed to forward to n8n webhook' },
                { status: 500 }
            );
        }
    } else {
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
}

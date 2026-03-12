import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-02-25.clover', // Use the latest API version or your desired one
});

export async function POST(req: Request) {
    try {
        const origin = req.headers.get('origin') || 'http://localhost:3000';

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: 'price_1TA7ClDFGfAT1f98zt1S8ekd', // The Price ID provided by the user
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/success`,
            cancel_url: `${origin}/#starterpackoffer`,
            // You can add customer_email or client_reference_id if you gather email beforehand
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating Stripe checkout session:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

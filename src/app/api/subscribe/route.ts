import { NextResponse } from 'next/server';
import { vokativ } from 'vokativ';

export async function POST(req: Request) {
    try {
        const { email, firstName, lastName, formId, tagId } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const API_KEY = process.env.CONVERTKIT_API_KEY;
        const DEFAULT_FORM_ID = process.env.CONVERTKIT_FORM_ID;
        const FINAL_FORM_ID = formId || DEFAULT_FORM_ID;

        // Compute vocative case for the first name if it exists (and capitalize it)
        const rawVocative = firstName ? vokativ(firstName) : undefined;
        const vocativeName = rawVocative ? rawVocative.charAt(0).toUpperCase() + rawVocative.slice(1) : undefined;

        console.log(`Subscribing ${email} to Kit: Form ID: ${FINAL_FORM_ID}, Tag ID: ${tagId || 'none'}, Vocative: ${vocativeName}`);

        if (!API_KEY || !FINAL_FORM_ID) {
            console.error('Missing ConvertKit configuration (API_KEY or FORM_ID)');
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        const url = `https://api.convertkit.com/v3/forms/${FINAL_FORM_ID}/subscribe`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: API_KEY,
                email: email,
                first_name: firstName,
                tags: tagId ? [tagId] : undefined,
                fields: {
                    last_name: lastName,
                    vokativ: vocativeName,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('ConvertKit API error:', data);
            return NextResponse.json(
                { error: data.message || 'Failed to subscribe' },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true, subscriber: data.subscription });
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

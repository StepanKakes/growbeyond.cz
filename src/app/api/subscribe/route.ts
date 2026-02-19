import { NextResponse } from 'next/server';
import { vokativ } from 'vokativ';

export async function POST(req: Request) {
    try {
        const { email, firstName, formId, tagId, sequenceId } = await req.json();

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

        console.log(`Subscribing ${email} to Kit: Form ID: ${FINAL_FORM_ID}, Tag ID: ${tagId || 'none'}, Sequence ID: ${sequenceId || 'none'}, Vocative: ${vocativeName}`);

        if (!API_KEY || !FINAL_FORM_ID) {
            console.error('Missing ConvertKit configuration (API_KEY or FORM_ID)');
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        // 1. Subscribe to Form/Tag
        const subscribeUrl = `https://api.convertkit.com/v3/forms/${FINAL_FORM_ID}/subscribe`;
        const subscribeResponse = await fetch(subscribeUrl, {
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
                    vokativ: vocativeName,
                },
            }),
        });

        const subscribeData = await subscribeResponse.json();

        if (!subscribeResponse.ok) {
            console.error('ConvertKit Form Subscribe error:', subscribeData);
            return NextResponse.json(
                { error: subscribeData.message || 'Failed to subscribe' },
                { status: subscribeResponse.status }
            );
        }

        // 2. Subscribe to Sequence if sequenceId is provided
        if (sequenceId) {
            const sequenceUrl = `https://api.convertkit.com/v3/sequences/${sequenceId}/subscribe`;
            const sequenceResponse = await fetch(sequenceUrl, {
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
                        vokativ: vocativeName,
                    },
                }),
            });

            if (!sequenceResponse.ok) {
                const sequenceData = await sequenceResponse.json();
                console.error('ConvertKit Sequence Subscribe error:', sequenceData);
                // We don't fail the whole request because form subscription was already successful
            } else {
                console.log(`Successfully subscribed ${email} to sequence ${sequenceId}`);
            }
        }

        return NextResponse.json({ success: true, subscriber: subscribeData.subscription });
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { vokativ } from 'vokativ';

const PLUNK_API_URL = 'https://next-api.useplunk.com';

export async function POST(req: Request) {
    try {
        const { email, firstName, formId, tagId, sequenceId } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const PLUNK_SECRET_KEY = process.env.PLUNK_SECRET_KEY;
        if (!PLUNK_SECRET_KEY) {
            console.error('Missing PLUNK_SECRET_KEY env var');
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }

        const justFirstName = firstName ? firstName.trim().split(/\s+/)[0] : undefined;
        const rawVocative = justFirstName ? vokativ(justFirstName) : undefined;
        const vocativeName = rawVocative
            ? rawVocative.charAt(0).toUpperCase() + rawVocative.slice(1)
            : undefined;

        const eventName = formId || 'signup';
        const contactData: Record<string, string> = {};
        if (justFirstName) contactData.firstName = justFirstName;
        if (firstName) contactData.fullName = firstName;
        if (vocativeName) contactData.vokativ = vocativeName;
        if (tagId) contactData.tag = tagId;

        console.log(
            `Subscribing ${email} to Plunk — event=${eventName}, tag=${tagId || 'none'}, sequence=${sequenceId || 'none'}, vokativ=${vocativeName}`,
        );

        const trackRes = await fetch(`${PLUNK_API_URL}/v1/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${PLUNK_SECRET_KEY}`,
            },
            body: JSON.stringify({
                event: eventName,
                email,
                subscribed: true,
                data: contactData,
            }),
        });

        const trackData = await trackRes.json();
        if (!trackRes.ok) {
            console.error('Plunk track error:', trackData);
            return NextResponse.json(
                { error: trackData?.error?.message || 'Failed to subscribe' },
                { status: trackRes.status },
            );
        }

        if (sequenceId) {
            const seqRes = await fetch(`${PLUNK_API_URL}/v1/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${PLUNK_SECRET_KEY}`,
                },
                body: JSON.stringify({
                    event: `start:${sequenceId}`,
                    email,
                    subscribed: true,
                    data: contactData,
                }),
            });

            if (!seqRes.ok) {
                const seqData = await seqRes.json().catch(() => ({}));
                console.error('Plunk sequence track error:', seqData);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

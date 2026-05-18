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

        const authHeaders = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PLUNK_SECRET_KEY}`,
        };

        const contactRes = await fetch(`${PLUNK_API_URL}/contacts`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ email, subscribed: true, data: contactData }),
        });
        const contact = await contactRes.json();
        if (!contactRes.ok || !contact?.id) {
            console.error('Plunk upsert contact error:', contact);
            return NextResponse.json(
                { error: contact?.error?.message || 'Failed to subscribe' },
                { status: contactRes.status || 500 },
            );
        }

        const trackRes = await fetch(`${PLUNK_API_URL}/events/track`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ name: eventName, contactId: contact.id, data: contactData }),
        });
        if (!trackRes.ok) {
            const trackData = await trackRes.json().catch(() => ({}));
            console.error('Plunk track event error:', trackData);
        }

        if (sequenceId) {
            const seqRes = await fetch(`${PLUNK_API_URL}/events/track`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    name: `start:${sequenceId}`,
                    contactId: contact.id,
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

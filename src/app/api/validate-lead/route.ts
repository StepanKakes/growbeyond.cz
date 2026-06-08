import { NextRequest, NextResponse } from 'next/server';
import { validateEmail, validateInstagram } from '@/lib/validate-contact';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const { email, igHandle } = await request.json().catch(() => ({})) as {
        email?: string;
        igHandle?: string;
    };

    const [emailRes, igRes] = await Promise.all([
        validateEmail(email || ''),
        validateInstagram(igHandle || ''),
    ]);

    const errors: { email?: string; igHandle?: string } = {};
    if (!emailRes.ok) errors.email = emailRes.reason;
    if (!igRes.ok) errors.igHandle = igRes.reason;

    const ok = Object.keys(errors).length === 0;
    return NextResponse.json({ ok, errors });
}

import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    const systemPin = process.env.SOP_ACCESS_PIN || '4774';

    if (pin === systemPin) {
      // Create a secure cookie for authorization
      const cookie = serialize('sop_authorized', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week access
        path: '/',
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Set-Cookie': cookie },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Zadaný PIN je neplatný' }, 
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Při přihlašování došlo k chybě' }, 
      { status: 500 }
    );
  }
}

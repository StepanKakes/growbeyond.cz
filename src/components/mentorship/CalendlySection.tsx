"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cal, { getCalApi } from '@calcom/embed-react';
import { FadeUp } from '../FadeUp';

const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK ?? 'creationwithtim/strategicky-hovor';

export const CalendlySection = ({ prefillEmail, followupEligible = true }: { prefillEmail?: string; followupEligible?: boolean }) => {
    const router = useRouter();

    // Označ, že žadatel se dostal ke kalendáři — tím se spustí Plunk workflow
    // s 15min follow-upem. Follow-up posíláme jen lidem s investicí nad
    // 0–10 tis. Kč (followupEligible); kdo zvolil nejnižší rozpočet, event
    // nedostane, i kdyby rozpočtovou bránou prošel a ke kalendáři se dostal.
    useEffect(() => {
        if (!prefillEmail || !followupEligible) return;
        fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: prefillEmail, plunkEvent: 'prihlaska-mentoring' }),
        }).catch(() => { /* non-blocking — tracking nesmí shodit UI */ });
    }, [prefillEmail, followupEligible]);

    useEffect(() => {
        (async () => {
            const cal = await getCalApi({ namespace: 'booking' });
            cal('on', {
                action: 'bookingSuccessful',
                callback: () => {
                    // Rezervace proběhla → zruš follow-up tím, že workflow dostane
                    // event, na který čeká (WAIT_FOR_EVENT 'rezervace-hovoru').
                    if (prefillEmail) {
                        fetch('/api/subscribe', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: prefillEmail, plunkEvent: 'rezervace-hovoru' }),
                        }).catch(() => { /* non-blocking */ });
                    }
                    router.push('/po-rezervaci');
                },
            });
        })();
    }, [router, prefillEmail]);

    return (
        <section id="cal-booking" className="pt-6 md:pt-8 pb-32 px-4 relative z-20 bg-transparent">
            <div className="max-w-[1000px] mx-auto w-full flex flex-col gap-12 lg:gap-16">
                <div className="w-full">
                    <FadeUp>
                        <Cal
                            namespace="booking"
                            calLink={CAL_LINK}
                            style={{ width: '100%', minHeight: '700px' }}
                            config={{
                                layout: 'month_view',
                                locale: 'cs',
                                ...(prefillEmail ? { email: prefillEmail } : {}),
                            }}
                        />
                    </FadeUp>
                </div>
            </div>
        </section>
    );
};

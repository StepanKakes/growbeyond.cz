"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cal, { getCalApi } from '@calcom/embed-react';
import { FadeUp } from '../FadeUp';

const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK ?? 'tim-creationwithtim/strategicky-call';

export const CalendlySection = ({ prefillEmail }: { prefillEmail?: string }) => {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const cal = await getCalApi({ namespace: 'booking' });
            cal('on', {
                action: 'bookingSuccessful',
                callback: () => router.push('/po-rezervaci'),
            });
        })();
    }, [router]);

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
                                ...(prefillEmail ? { email: prefillEmail } : {}),
                            }}
                        />
                    </FadeUp>
                </div>
            </div>
        </section>
    );
};

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cal, { getCalApi } from '@calcom/embed-react';

// Stejný typ hovoru jako za přihláškou, ať rezervace ze záznamu padají
// do webinářové konverze a webhook /api/webinar/cal je spáruje.
const CAL_LINK = 'creationwithtim/webinar-2030-hovor';

export const WebinarCalEmbed = () => {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const cal = await getCalApi({ namespace: 'webinar-zaznam' });
            cal('ui', { theme: 'dark', hideEventTypeDetails: false });
            cal('on', { action: 'bookingSuccessful', callback: () => router.push('/webinar/hotovo') });
        })();
    }, [router]);

    return (
        <Cal
            namespace="webinar-zaznam"
            calLink={CAL_LINK}
            style={{ width: '100%', minHeight: '700px' }}
            config={{ layout: 'month_view', locale: 'cs', theme: 'dark' }}
        />
    );
};

"use client";

import dynamic from 'next/dynamic';

// Plyr sahá na document → nesmí se prerenderovat na serveru. Stejný pattern
// jako StrategieVideoBooking (dynamic ssr:false uvnitř client komponenty).
const MentorshipVideoSection = dynamic(
    () => import('@/components/mentorship/MentorshipVideoSection').then(m => m.MentorshipVideoSection),
    { ssr: false }
);

export const ProgramVideo = (props: {
    videoUrl: string;
    posterUrl?: string;
    trackCid?: string;
    trackDay?: number;
    nativeProgress?: boolean;
}) => <MentorshipVideoSection {...props} />;

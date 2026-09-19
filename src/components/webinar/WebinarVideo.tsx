"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { WEBINAR } from './webinarConfig';

// Plyr sahá na document → nesmí se prerenderovat na serveru. Stejný pattern
// jako ProgramVideo (dynamic ssr:false uvnitř client komponenty).
const MentorshipVideoSection = dynamic(
    () => import('@/components/mentorship/MentorshipVideoSection').then(m => m.MentorshipVideoSection),
    { ssr: false }
);

/**
 * VSL v hero webináře. Stejný autoplay přehrávač jako na /strategie a
 * u programových videí: rozjede se potichu, jakmile na něj divák doscrolluje,
 * a klik na překryv zapne zvuk a pustí video od začátku.
 */
export const WebinarVideo = () => (
    <MentorshipVideoSection videoUrl={WEBINAR.video.src} posterUrl={WEBINAR.video.poster} />
);

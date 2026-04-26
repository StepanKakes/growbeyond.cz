"use client";

import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';

const plyrSource = {
    type: 'video' as const,
    sources: [{ src: 'MCyU7twLrdc', provider: 'youtube' as const }],
};

const plyrOptions = {
    ratio: '16:9',
    muted: false,
    autoplay: false,
    youtube: { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 },
    quality: { default: 2160, options: [4320, 2160, 1440, 1080, 720, 480, 360, 240, 144] },
    controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'fullscreen'],
};

export default function VideoPlayer() {
    return (
        <div className="relative rounded-lg md:rounded-xl overflow-hidden border border-white/10 bg-[#151515]">
            <style>{`
                .plyr { --plyr-color-main: #FF0E00; --plyr-video-background: #111111; }
            `}</style>
            <div className="w-full relative pb-[56.25%]">
                <div className="absolute inset-0">
                    <Plyr source={plyrSource} options={plyrOptions} />
                </div>
            </div>
        </div>
    );
}

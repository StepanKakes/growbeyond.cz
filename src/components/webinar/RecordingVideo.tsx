"use client";

// Přehrávač záznamu bez tlačítka stáhnout a bez kontextové nabídky
// (Uložit video jako). Odhodlaného člověka to nezastaví, běžného ano.
export const RecordingVideo = ({ src, poster }: { src: string; poster: string }) => (
    <video
        src={src}
        poster={poster}
        controls
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={e => e.preventDefault()}
        playsInline
        preload="metadata"
        className="block aspect-video w-full"
    />
);

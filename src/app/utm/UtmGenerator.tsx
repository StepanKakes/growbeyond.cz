"use client";

import { useState, useMemo, useEffect } from 'react';
import { extractYouTubeId, slugify } from '@/lib/youtube';

const BASE_URL = 'https://growbeyond.cz/';

export const UtmGenerator = () => {
    const [ytInput, setYtInput] = useState('');
    const [campaign, setCampaign] = useState('');
    const [campaignEdited, setCampaignEdited] = useState(false);
    const [videoTitle, setVideoTitle] = useState('');
    const [titleLoading, setTitleLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const videoId = useMemo(() => extractYouTubeId(ytInput), [ytInput]);

    useEffect(() => {
        if (!videoId) {
            setVideoTitle('');
            return;
        }
        let cancelled = false;
        setTitleLoading(true);
        fetch(`/api/youtube-title?id=${videoId}`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then((data: { title?: string }) => {
                if (cancelled) return;
                const title = data.title ?? '';
                setVideoTitle(title);
                if (!campaignEdited && title) setCampaign(title);
            })
            .catch(() => { if (!cancelled) setVideoTitle(''); })
            .finally(() => { if (!cancelled) setTitleLoading(false); });
        return () => { cancelled = true; };
    }, [videoId, campaignEdited]);

    const generated = useMemo(() => {
        if (!videoId) return '';
        const slug = campaign.trim() ? slugify(campaign) : `video-${videoId}`;
        const params = new URLSearchParams({
            utm_source: 'youtube',
            utm_campaign: slug,
            utm_content: videoId,
        });
        return `${BASE_URL}?${params.toString()}#apply`;
    }, [videoId, campaign]);

    const handleCopy = async () => {
        if (!generated) return;
        await navigator.clipboard.writeText(generated);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <main className="min-h-screen bg-brand-dark text-white font-sans py-16 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">UTM Generator</h1>
                <p className="text-white/60 mb-10">Vlož YouTube URL a získej hotový link pod video.</p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">
                            YouTube URL nebo Video ID
                        </label>
                        <input
                            type="text"
                            value={ytInput}
                            onChange={e => setYtInput(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                            autoFocus
                        />
                        {ytInput && !videoId && (
                            <p className="text-red-400 text-sm mt-2">Nepodařilo se rozpoznat YouTube ID</p>
                        )}
                        {videoId && (
                            <p className="text-white/40 text-sm mt-2">
                                Video ID: <span className="font-mono text-white/70">{videoId}</span>
                                {titleLoading && <span className="ml-2 text-white/30">načítám název…</span>}
                                {videoTitle && !titleLoading && <span className="ml-2 text-white/70">— {videoTitle}</span>}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">
                            Název kampaně <span className="text-white/30 normal-case">(automaticky z názvu videa, můžeš upravit)</span>
                        </label>
                        <input
                            type="text"
                            value={campaign}
                            onChange={e => { setCampaign(e.target.value); setCampaignEdited(true); }}
                            placeholder="Jak začít s Instagramem"
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                        />
                        {campaign && (
                            <p className="text-white/40 text-sm mt-2">Slug: <span className="font-mono text-white/70">{slugify(campaign)}</span></p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">
                            Vygenerovaný link
                        </label>
                        <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4 font-mono text-sm break-all min-h-[80px] flex items-center">
                            {generated ? (
                                <span className="text-white/90">{generated}</span>
                            ) : (
                                <span className="text-white/30">Vlož YouTube URL výše…</span>
                            )}
                        </div>
                        <button
                            onClick={handleCopy}
                            disabled={!generated}
                            className="mt-3 w-full bg-brand-red hover:bg-[#cc0b00] disabled:bg-[#333] disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors uppercase tracking-wider text-sm"
                        >
                            {copied ? 'Zkopírováno ✓' : 'Zkopírovat'}
                        </button>
                    </div>
                </div>

                <div className="mt-12 p-6 bg-[#1A1A1A] rounded-lg border border-white/5 text-sm text-white/60 leading-relaxed">
                    <p className="font-bold text-white mb-2">Jak používat:</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Vlož URL videa z YouTube (nebo jen 11-znakový ID)</li>
                        <li>Volitelně přejmenuj kampaň (jinak se použije <code className="text-white/80">video-ID</code>)</li>
                        <li>Zkopíruj link a vlož ho do popisu YouTube videa</li>
                    </ol>
                </div>
            </div>
        </main>
    );
};

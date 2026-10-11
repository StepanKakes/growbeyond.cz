import type { Metadata } from 'next';
import { seznamNavstev, type NavstevaRadek } from '@/lib/navstevnici/beh';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Návštěvníci | Growbeyond',
    robots: { index: false, follow: false },
};

const STAV: Record<string, { text: string; trida: string }> = {
    odeslano: { text: 'Odesláno', trida: 'text-green-400 border-green-400/30' },
    nahled: { text: 'Náhled', trida: 'text-amber-300 border-amber-300/30' },
    preskoceno: { text: 'Přeskočeno', trida: 'text-gray-400 border-white/10' },
    chyba: { text: 'Chyba', trida: 'text-brand-red border-brand-red/40' },
};

const cas = (iso: string) => new Date(iso).toLocaleString('cs-CZ', { timeZone: 'Europe/Prague', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });

function Radek({ r }: { r: NavstevaRadek }) {
    const s = STAV[r.stav] ?? STAV.preskoceno;
    const stranky = [...new Set((r.stranky || []).filter(u => u.udalost === '$pageview').map(u => u.cesta))];
    const akce = [...new Set((r.stranky || []).map(u => u.udalost).filter(u => !u.startsWith('$')))];
    return (
        <details className="rounded-xl border border-white/10 bg-[#131313] open:bg-[#161616]">
            <summary className="flex items-center gap-4 px-4 py-3 cursor-pointer list-none">
                <span className="w-24 shrink-0 text-xs text-gray-500 tabular-nums">{cas(r.konec || r.created_at)}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-gray-100" title={r.email}>{r.jmeno ? `${r.jmeno}, ` : ''}{r.email}</span>
                <span className="hidden md:block w-44 shrink-0 truncate text-xs text-gray-300" title={r.typ || ''}>{r.typ || ''}</span>
                <span className={`w-24 shrink-0 rounded-md border px-2 py-0.5 text-center text-xs ${s.trida}`}>{s.text}</span>
            </summary>
            <div className="border-t border-white/10 px-4 py-4 text-sm text-gray-300 space-y-3">
                {r.duvod && <p className="text-gray-400">{r.duvod}</p>}
                {r.typ && <p>Typ <span className="text-gray-100">{r.typ}</span></p>}
                <p className="text-gray-400 break-words">Stránky: {stranky.join(', ') || 'žádné'}</p>
                {akce.length > 0 && <p className="text-gray-400 break-words">Akce: {akce.join(', ')}</p>}
                {r.text && (
                    <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                        <p className="mb-2 font-bold text-gray-100">{r.predmet}</p>
                        <p className="whitespace-pre-line text-gray-300">{r.text}</p>
                    </div>
                )}
            </div>
        </details>
    );
}

export default async function NavstevniciPage() {
    let radky: NavstevaRadek[] = [];
    let chyba = '';
    try {
        radky = await seznamNavstev();
    } catch (e) {
        chyba = e instanceof Error ? e.message : String(e);
    }
    const ostre = process.env.NAVSTEVNICI_ODESILAT === '1';
    return (
        <main className="min-h-screen bg-[#0d0d0d] px-4 py-10 text-white md:px-8">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-2xl font-bold">Návštěvníci</h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-400">
                    Ukončené návštěvy lidí, které známe podle e-mailu, a co jim systém poslal nebo by poslal.
                    {ostre ? ' Odesílání je zapnuté.' : ' Odesílání je vypnuté, e-maily jsou jen náhled.'}
                </p>
                {chyba && <p className="mt-6 text-sm text-brand-red">{chyba}</p>}
                {!chyba && radky.length === 0 && <p className="mt-10 text-sm text-gray-500">Zatím tu nic není. První záznamy přibydou, až PostHog nasbírá návštěvy známých kontaktů.</p>}
                <div className="mt-8 space-y-2">
                    {radky.map(r => <Radek key={r.id} r={r} />)}
                </div>
            </div>
        </main>
    );
}

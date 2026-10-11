// Rozhodovací model: typované otázky nad stavem, zpátky pravděpodobnosti.
// Negeneruje text, jen vybírá. Výchozí je Jev 1.13 přes OpenRouter (stejný
// klient jako v Beovi). Laya má schéma odpovědí shodné s Jevem, takže
// přechod na ni je jen ROZHODOVAC_URL a ROZHODOVAC_MODEL v env.

const URL_ = process.env.ROZHODOVAC_URL || 'https://openrouter.ai/api/v1/systemone';
export const MODEL = process.env.ROZHODOVAC_MODEL || 'typesafe/jev-1.13';
const STROP_MS = 8_000;

export type Otazka =
    | { type: 'noul'; instructions: unknown; criteria?: { true?: unknown; false?: unknown } }
    | { type: 'choice'; instructions: unknown; criteria: Record<string, unknown> };

export type OdpovedNoul = { type: 'noul'; noul: number };
export type OdpovedChoice = { type: 'choice'; choice: string; probabilities: Record<string, number>; confidence: number };

export async function rozhodni(stav: unknown, otazky: Record<string, Otazka>): Promise<Record<string, OdpovedNoul | OdpovedChoice>> {
    const klic = process.env.ROZHODOVAC_KEY || process.env.OPENROUTER_API_KEY;
    if (!klic) throw new Error('Chybí OPENROUTER_API_KEY');
    const telo = JSON.stringify({ model: MODEL, state: stav, questions: otazky });

    const pokus = async () => {
        const res = await fetch(URL_, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${klic}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://growbeyond.cz',
                'X-Title': 'growbeyond.cz navstevnici',
            },
            body: telo,
            signal: AbortSignal.timeout(STROP_MS),
        });
        if (!res.ok) {
            const e = new Error(`Rozhodovač ${res.status}: ${(await res.text()).slice(0, 300)}`) as Error & { status?: number };
            e.status = res.status;
            throw e;
        }
        const json = await res.json() as { answers?: Record<string, OdpovedNoul | OdpovedChoice> };
        for (const k of Object.keys(otazky)) {
            if (!json.answers?.[k]) throw new Error(`Rozhodovač neodpověděl na ${k}`);
        }
        return json.answers!;
    };

    try {
        return await pokus();
    } catch (e) {
        // Na neplatné zadání se neopakuje, dopadlo by stejně
        const status = (e as { status?: number }).status;
        if (status && status < 500) throw e;
        return await pokus();
    }
}

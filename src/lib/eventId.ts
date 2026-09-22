import { createHash } from 'node:crypto';

/**
 * Stabilní id konverze pro Meta Pixel.
 *
 * Prohlížeč posílá id s událostí (`eventID`), takže se serverová kopie téže
 * události spáruje a nezapočítá se dvakrát. Když se id odvodí od registrace
 * a ne od okamžiku odeslání, přežije i obnovení stránky nebo druhé kliknutí
 * na tlačítko: je to pořád jedna konverze.
 *
 * Hashuje se, aby se vnitřní identifikátory neposílaly ven.
 */
export function eventIdFor(druh: string, klic: string): string {
    return createHash('sha256').update(`${druh}:${klic}`).digest('hex').slice(0, 32);
}

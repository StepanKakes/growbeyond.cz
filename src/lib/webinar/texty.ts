// TEXTY ZPRÁV WEBINÁŘE
//
// Tady se ladí znění. Logiku odesílání to neřeší, ta žije v schedule.ts.
//
// ZÁSTUPNÉ ZNAČKY, které se doplní za běhu:
//   {jmeno}    oslovení v pátém pádu, například "Time". Když jméno neznáme,
//              zmizí i mezera za ním, takže věta začne velkým písmenem
//   {nazev}    název webináře, teď "2030"
//   {termin}   "v pondělí 21. 9. v 17:00"
//   {cas}      "17:00"
//   {delka}    "75"
//   {odkaz}    osobní odkaz na vysílání ze Zoomu. Posílá se schválně až
//              ve zprávě těsně před startem, aby dřív nezapadl
//   {skupina}  odkaz do WhatsApp skupiny
//   {stranka}  osobní stránka s termínem a kalendářem
//   {prihlaska} odkaz na přihlášku na hovor
//
// VARIANTY: každá WhatsApp zpráva má tři znění. Systém je střídá podle
// člověka, aby nešel tisíckrát za sebou identický text, což je jeden ze
// signálů, podle kterých WhatsApp pozná hromadné rozesílání. Když nějakou
// variantu smažeš, prostě se použijí zbylé.
//
// PRAVIDLA: bez emoji, bez pomlček, věty nekončí tečkou.

export const WA_TEXTY = {
    /* ------------------------------------------------------------------
       1. POTVRZENÍ, dvě minuty po registraci
       První zpráva, kterou od nás člověk dostane.
    ------------------------------------------------------------------ */
    potvrzeni: [
        `Ahoj {jmeno}, jsi přihlášený na náš webinář {nazev}, {termin}.

Dvě důležité věci před začátkem:

Přidej si webinář do kalendáře ať to nepropásneš: {stranka}

Připoj se do naší skupiny, kde budu sdílet veškeré informace navíc a záznam z webináře: {skupina}

To je všechno, budu se na tebe těšit!

Tim`,

        `Ahoj {jmeno}, máš rezervované místo na našem webináři {nazev}, {termin}.

Ještě dvě věci, než začneme:

Přidej si webinář do kalendáře ať ti neuteče: {stranka}

Připoj se do naší skupiny, kde budu sdílet veškeré informace navíc a záznam z webináře: {skupina}

A to je vše, budu se na tebe těšit!

Tim`,

        `Ahoj {jmeno}, tvoje registrace na webinář {nazev} je hotová, vysíláme {termin}.

Dvě věci, ať z toho vytěžíš maximum:

Přidej si webinář do kalendáře ať to nepropásneš: {stranka}

Připoj se do naší skupiny, kde budu sdílet veškeré informace navíc a záznam z webináře: {skupina}

To je vše, budu se na tebe těšit!

Tim`,
    ],

    /* ------------------------------------------------------------------
       2. DEN PŘED, přesně 24 hodin před začátkem
    ------------------------------------------------------------------ */
    denPred: [
        `Ahoj {jmeno}, už zítra se vidíme! Webinář {nazev} startuje v {cas}.

Odkaz na vysílání ti pošlu těsně před začátkem.

Doporučuju se připojit z počítače a mít po ruce volný sešit, bude se ti hodit.

Tim`,

        `Ahoj {jmeno}, zítra už jdeme na to! Webinář {nazev} začíná v {cas}.

Odkaz na vysílání ti pošlu sem, těsně předtím.

Doporučuju se připojit z počítače a mít po ruce volný sešit, bude se ti hodit.

Tim`,

        `Ahoj {jmeno}, už zítra se vidíme! {nazev} startuje v {cas}.

Odkaz na vysílání ode mě dostaneš krátce před začátkem.

Doporučuju se připojit z počítače a mít po ruce volný sešit, bude se ti hodit.

Tim`,
    ],

    /* ------------------------------------------------------------------
       3. TŘI HODINY PŘED
    ------------------------------------------------------------------ */
    triHodiny: [
        `Ahoj {jmeno}, už za tři hodiny to vypukne, v {cas} začínáme živě.

Odkaz ti pošlu sem do chatu, pár minut předtím, než začneme.

Tim`,

        `Ahoj {jmeno}, zbývají tři hodiny, v {cas} jdeme živě.

Odkaz ti pošlu sem do chatu, pár minut předtím, než začneme.

Tim`,

        `Ahoj {jmeno}, už za tři hodiny začínáme, vysíláme od {cas}.

Odkaz ti sem hodím pár minut předtím, než to spustíme.

Tim`,
    ],

    /* ------------------------------------------------------------------
       4. TĚSNĚ PŘED STARTEM, odchází zhruba dvanáct minut předem
       Jediná zpráva s odkazem na vysílání. Posílá se s předstihem, aby
       dávka doběhla ještě před začátkem.
    ------------------------------------------------------------------ */
    tesnePred: [
        `Ahoj {jmeno}, je to tu, začínáme! Připoj se, ať ti nic neuteče.

Odkaz na webinář: {odkaz}

Tim`,

        `Ahoj {jmeno}, jdeme na to, začínáme! Připoj se, ať ti nic neuteče.

Odkaz na webinář: {odkaz}

Tim`,

        `Ahoj {jmeno}, je to tu, za chvíli spouštím! Připoj se, ať ti nic neuteče.

Odkaz na webinář: {odkaz}

Tim`,
    ],
};

/* ====================================================================
   EMAILY, které posílá náš systém
   Zbylých deset mailů (hodnota a upomínky) žije v Plunku jako kampaně,
   ty se upravují tam.
==================================================================== */

export const EMAIL_TEXTY = {
    /* ------------------------------------------------------------------
       POTVRZENÍ REGISTRACE, odchází hned po přihlášení
    ------------------------------------------------------------------ */
    potvrzeni: {
        predmet: `Máš místo na webináři {nazev}`,
        telo: `Ahoj {jmeno},

máš rezervované místo na webináři {nazev}, vysíláme živě {termin}

[tlačítko: Odkaz na živé vysílání -> {odkaz}]

Ulož si ho, pošlu ti ho ještě několikrát, ale ať ho máš po ruce

Založil jsem k webináři WhatsApp skupinu, kam do té doby dávám videa a věci, co se na webinář nevejdou. Píšu tam jen já a tým, takže tě to nezavalí
[odkaz: Přidej se do skupiny -> {skupina}]

Ať z toho vytěžíš co nejvíc, mrkni na svoji stránku a odpověz mi na dvě otázky, podle nich poskládám obsah tak, aby seděl lidem, co přijdou
[odkaz: Otevřít moji stránku -> {stranka}]`,
    },

    /* ------------------------------------------------------------------
       PO WEBINÁŘI, ÚČASTNÍKŮM, půl hodiny po konci
    ------------------------------------------------------------------ */
    poWebinariUcastnik: {
        predmet: 'Díky, že jsi byl, a co dál',
        telo: `Ahoj {jmeno},

díky, že sis udělal čas

Jak jsem na konci říkal, pro ty, co s tím chtějí něco udělat, máme volné termíny na osobní hovor. Projdeme, kde jsi teď, co ti v distribuci chybí a jestli ti umíme pomoct

Není to prodejní hovor na sílu, když to nedává smysl, řeknu to rovnou

[tlačítko: Vyplnit přihlášku -> {prihlaska}]`,
    },

    /* ------------------------------------------------------------------
       PO WEBINÁŘI, KDO NEDORAZIL, půl hodiny po konci
       Dokud není záznam vyplněný u edice, odstavec s tlačítkem vypadne
       a mail odejde bez něj.
    ------------------------------------------------------------------ */
    poWebinariNedorazil: {
        predmet: 'Nestihl jsi to, mám pro tebe záznam',
        telo: `Ahoj {jmeno},

nedorazil jsi, což chápu, život se stane

Záznam ti nechám dostupný pár dní, potom ho stahuju

[tlačítko: Pustit záznam -> {zaznam}]`,
    },
};

/* ====================================================================
   ZPRÁVY DO WHATSAPP SKUPINY

   Stroj tu dělá jen časování, tedy upomínky a odkazy. Obsah, videa
   a myšlenky, posílá tým ručně, protože právě ta nepravidelnost je
   důvod, proč skupina funguje líp než hromadný mail.

   Pozor: kdo vstoupí do skupiny později, starší zprávy neuvidí, tak to
   WhatsApp má. Každá zpráva proto musí dávat smysl sama o sobě a nesmí
   navazovat na předchozí.
==================================================================== */

export const SKUPINA_TEXTY: { klic: string; offsetMinut: number; popis: string; text: string }[] = [
    {
        klic: 'g-den-pred',
        offsetMinut: -24 * 60,
        popis: 'Den před webinářem v 17:00',
        text: `Zítra je den D, webinář {nazev} startuje v {cas}.

Odkaz na vysílání dostanete v mailu i sem do skupiny, těsně před začátkem.

Doporučuju se připojit z počítače a mít po ruce něco na psaní.`,
    },
    {
        klic: 'g-rano',
        offsetMinut: -8 * 60,
        popis: 'V den webináře ráno',
        text: `Dnes v {cas} jdeme živě.

Vezměte si papír, budeme dělat jedno cvičení, po kterém budete vědět, co vám v distribuci chybí.`,
    },
    {
        klic: 'g-hodina',
        offsetMinut: -60,
        popis: 'Hodinu před startem',
        text: `Za hodinu začínáme. Odkaz sem hodím pár minut před startem.`,
    },
    {
        klic: 'g-start',
        offsetMinut: -10,
        popis: 'Deset minut před startem, jediná zpráva s odkazem',
        text: `Jdeme na to, za chvíli spouštím vysílání.

Odkaz na webinář: {odkaz}`,
    },
    {
        klic: 'g-po-konci',
        offsetMinut: 90,
        popis: 'Po konci vysílání',
        text: `Díky všem, kdo dorazili.

Kdo si chce projít, co dál, ať mi napíše, nebo si rovnou vyberte termín na hovor: {prihlaska}`,
    },
    {
        klic: 'g-zaznam',
        offsetMinut: 20 * 60,
        popis: 'Den po webináři dopoledne, jen když je vyplněný záznam',
        text: `Záznam webináře je venku, nechám ho tu pár dní: {zaznam}`,
    },
];

/* ====================================================================
   KDY CO ODCHÁZÍ, celý plán pohromadě

   HNED PO REGISTRACI      email  potvrzení registrace
   +2 minuty               WA     potvrzení
   7 dní před              email  hodnota 1          (Plunk)
   5 dní před              email  hodnota 2          (Plunk)
   3 dny před              email  hodnota 3          (Plunk)
   2 dny před              email  hodnota 4          (Plunk)
   1 den před              email  upomínka           (Plunk)
   1 den před              WA     den před
   ráno v den D            email  dnes v 17:00       (Plunk)
   3 hodiny před           email  za tři hodiny      (Plunk)
   3 hodiny před           WA     tři hodiny
   30 minut před           email  za půl hodiny      (Plunk)
   12 minut před           WA     těsně před startem
   5 minut před            email  začínáme           (Plunk)
   20 minut po startu      email  jsme živě          (Plunk)
   půl hodiny po konci     email  účastníkům nebo těm, kdo nedorazili

   Kdo se přihlásí pozdě, dostane jen to, co ještě dává smysl. Zprávy
   v minulosti se přeskočí, nikdy nechodí zpětně.
==================================================================== */

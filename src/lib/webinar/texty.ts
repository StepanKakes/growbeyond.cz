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
//   {odkaz}    osobní odkaz na vysílání ze Zoomu
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
       První zpráva, kterou od nás člověk dostane. Na konec se automaticky
       přidá věta o odhlášení, tu neměň, drží nás mimo problémy.
    ------------------------------------------------------------------ */
    potvrzeni: [
        `Ahoj {jmeno}, zdravím, jsi přihlášený na náš webinář {nazev}, {termin}.

Mezitím se nezapomeň přidat do naší skupiny, kde budu sdílet veškeré informace navíc a záznam webináře: {skupina}

Taky si webinář přidej do kalendáře ať na něj nezapomeneš: {stranka}

Budu se na tebe těšit!

Tim`,

        `Ahoj {jmeno}, tady Tim, máme tvoji registraci na webinář {nazev}, {termin}.

Přidej se do naší skupiny, budu tam dávat všechno navíc i záznam z webináře: {skupina}

A hoď si termín do kalendáře, ať ti neuteče: {stranka}

Těším se na tebe!

Tim`,

        `Ahoj {jmeno}, díky za přihlášku na webinář {nazev}. Vysíláme {termin}.

Ve skupině budu sdílet informace navíc a po webináři tam dám i záznam, přidej se: {skupina}

Ať na termín nezapomeneš, ulož si ho do kalendáře: {stranka}

Budu se těšit!

Tim`,
    ],

    /* ------------------------------------------------------------------
       2. DEN PŘED, přesně 24 hodin před začátkem
    ------------------------------------------------------------------ */
    denPred: [
        `Ahoj {jmeno}, zítra už se vidíme! Webinář {nazev} startuje v {cas}.

Tady je tvůj odkaz na vysílání: {odkaz}

Doporučuju připojit se z počítače, budeš si chtít dělat poznámky.

Tim`,

        `Ahoj {jmeno}, jen připomínám, že zítra v {cas} jdeme živě.

Odkaz na vysílání máš tady: {odkaz}

Ulož si ho, ať ho zítra nemusíš hledat.

Tim`,

        `Ahoj {jmeno}, zítra to vypukne. Začínáme v {cas}.

Tvůj odkaz na vysílání: {odkaz}

Těším se na tebe!

Tim`,
    ],

    /* ------------------------------------------------------------------
       3. TŘI HODINY PŘED
    ------------------------------------------------------------------ */
    triHodiny: [
        `Ahoj {jmeno}, za tři hodiny to vypukne, v {cas} jdeme živě.

Tady je tvůj odkaz: {odkaz}

Tim`,

        `Ahoj {jmeno}, dneska v {cas} se vidíme, zbývají tři hodiny.

Odkaz na vysílání: {odkaz}

Tim`,

        `Ahoj {jmeno}, už jen tři hodiny a začínáme.

Připoj se tady: {odkaz}

Tim`,
    ],

    /* ------------------------------------------------------------------
       4. TĚSNĚ PŘED STARTEM, odchází zhruba dvanáct minut předem
       Posílá se s předstihem, aby dávka doběhla ještě před začátkem,
       proto text neslibuje přesný počet minut.
    ------------------------------------------------------------------ */
    tesnePred: [
        `Ahoj {jmeno}, za chvilku začínáme! Připoj se, ať ti nic neuteče.

Odkaz na vysílání: {odkaz}

Tim`,

        `Ahoj {jmeno}, jdeme na to, za chvíli spouštím vysílání.

Tady se připojíš: {odkaz}

Tim`,

        `Ahoj {jmeno}, už to bude, sejdeme se ve vysílání.

Odkaz: {odkaz}

Tim`,
    ],
};

/** Věta na konci první zprávy. Bez ní bychom neměli jak odhlásit. */
export const WA_ODHLASENI = 'Kdyby ti zprávy nesedly, napiš stop a už nic nepošlu';

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

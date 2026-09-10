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
        `Ahoj {jmeno}, tady Tim, díky za přihlášku na {nazev}, vysíláme {termin}

Do té doby dávám videa a materiály do skupiny, píšu tam jen já a tým
{skupina}

Odkaz na vysílání máš i v mailu, přidám ho znovu před startem`,

        `Ahoj {jmeno}, Tim z Beyond, mám tvoji rezervaci na {nazev}, jdeme živě {termin}

Mezitím posílám věci do skupiny k webináři, ať máš kontext dopředu
{skupina}

Před startem ti připomenu, ať to nezmeškáš`,

        `Ahoj {jmeno}, tady Tim, potvrzuju ti místo na webináři {nazev}, {termin}

Ke skupině, kde do té doby sdílím materiály, se přidáš tady
{skupina}

Ozvu se ještě před začátkem`,
    ],

    /* ------------------------------------------------------------------
       2. DEN PŘED, přesně 24 hodin před začátkem
    ------------------------------------------------------------------ */
    denPred: [
        `{jmeno}, zítra v {cas} jdeme živě, odkaz máš v mailu i tady
{odkaz}`,

        `Připomínka, zítra {cas} začínáme, tady je odkaz na vysílání
{odkaz}`,

        `{jmeno}, zítra se vidíme, start v {cas}
{odkaz}`,
    ],

    /* ------------------------------------------------------------------
       3. TŘI HODINY PŘED
    ------------------------------------------------------------------ */
    triHodiny: [
        `Za tři hodiny startujeme, odkaz
{odkaz}`,

        `{jmeno}, za tři hodiny jdeme na to
{odkaz}`,

        `Dnes v {cas}, zbývají tři hodiny
{odkaz}`,
    ],

    /* ------------------------------------------------------------------
       4. TĚSNĚ PŘED STARTEM, odchází zhruba dvanáct minut předem
       Posílá se s předstihem, aby dávka doběhla ještě před začátkem,
       proto text neslibuje přesný počet minut.
    ------------------------------------------------------------------ */
    tesnePred: [
        `Jdeme na to, za chvíli začínám
{odkaz}`,

        `{jmeno}, za chvilku startujeme
{odkaz}`,

        `Už to bude, přidej se
{odkaz}`,
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

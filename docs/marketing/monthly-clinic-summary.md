# Månedlig klinik-opsamling (kladder)

Automatisk e-mail til **klinikejere på Fysfinder** den 2. i hver måned. Mål: give et hurtigt bevis på, at Fysfinder hjælper potentielle patienter med at finde klinikken og tage næste skridt.

**Tone:** Joachim, troværdigt og enkelt. Ikke salgsagtigt, og overdriv ikke tallene.  
**Brand:** Fysfinder  
**Fra:** Joachim Bograd `<kontakt@fysfinder.dk>`  
**Emne:** *Sådan klarede din klinik sig på Fysfinder i august*  
**Preheader:** Samme som åbningslinjen, f.eks. *I august blev din klinik set 44 gange, og 5 patienter tog næste skridt ved at klikke videre.*

---

## Hvornår sendes den?

- **Den 2. i måneden** (så data for den foregående kalendermåned kan nå at lande).
- **Én mail pr. ejer.** Har de flere klinikker, står alle klinikker i samme mail.
- Klinikker, der først blev ejet efter periodens slut, springes over.
- Afmeldte Resend-kontakter og ejere uden e-mail springes over.
- Lav eller ingen aktivitet stopper **ikke** mailen.

---

## Brødtekst (plain)

I [måned] blev din klinik set **[N] gange**, og **[N] patienter** tog næste skridt ved at klikke videre.

### [Kliniknavn]

**[N] klinikvisninger**  
**[N]** visninger i søgeresultater  
**[N]** profilvisninger

**[N] tog næste skridt**  
**[N]** klikkede videre til dit website  
**[N]** viste dit telefonnummer  
**[N]** kopierede din e-mail  
**[N]** bookinger*

*Vil du også modtage bookinger direkte fra Fysfinder? Direkte booking er inkluderet med Premium.

Klinikprofil: 6 af 7
Tilføj f.eks. specialer.
Opdater

Har du spørgsmål til dine tal eller din profil, er du altid velkommen til at skrive. Jeg svarer selv.

**Joachim Bograd** fra Fysfinder

---

## Copy-regler

- Sprog: **du/din** konsekvent. Ikke I/jer.
- Ingen Hej. Åbningslinjen: visninger først, derefter næste skridt.
- Emne: *Sådan klarede din klinik sig på Fysfinder i [måned]*
- Vis kun website-, telefon- og e-mail-tal, hvis klinikken har den oplysning.
- `0 bookinger*` plus en tydelig Premium-boks, så det er tydeligt at direkte booking mangler.
- Ufuldstændig profil: *Klinikprofil: X af 7* under klinikkens tal (samme tælling som dashboard). Komplette profiler får ingen nudge.
- Senere: vis måned-til-måned, f.eks. `44 klinikvisninger ↑ 22% fra juli`.

---

## Implementering

- HTML/tekst bygges i `src/lib/monthly-clinic-summary-email.ts`
- Job: `scripts/send-monthly-clinic-summary.ts`
- Afmelding: `/api/email/unsubscribe?email=…&token=…`

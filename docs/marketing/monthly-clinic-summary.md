# Månedlig klinik-opsamling (kladder)

Automatisk e-mail til **klinikejere på Fysfinder** den 2. i hver måned. Mål: vise den værdi klinikken fik i den måned, der lige er afsluttet, og minde om hvordan de får flere henvendelser.

**Tone:** Joachim, enkelt sprog, personligt, nemt at svare tilbage.  
**Brand:** Fysfinder  
**Fra:** Joachim Bograd `<kontakt@fysfinder.dk>`  
**Emne:** *Dine resultater på Fysfinder: August*  
**Preheader:** Se hvor mange potentielle patienter der fandt og viste interesse for din klinik.

---

## Hvornår sendes den?

- **Den 2. i måneden** (så data for den foregående kalendermåned kan nå at lande).
- **Én mail pr. ejer.** Har de flere klinikker, står alle klinikker i samme mail.
- Klinikker, der først blev ejet efter periodens slut, springes over.
- Afmeldte Resend-kontakter og ejere uden e-mail springes over.
- Lav eller ingen aktivitet stopper **ikke** mailen.

---

## Brødtekst (plain)

Hej [navn]

Her er dit månedlige overblik fra Fysfinder. Se, hvordan potentielle patienter har fundet og interageret med din klinik i [måned].

### [Kliniknavn]

Din klinik er blevet vist **[N] gange**, og **[N] patienter tog næste skridt** ved at klikke videre fra din profil. Se detaljer i [dit dashboard](https://www.fysfinder.dk/dashboard).

---

## [N] patientinteraktioner

Patienter, der har taget næste skridt fra din profil.

**[N]** besøgte dit website  
**[N]** viste dit telefonnummer  
**[N]** kopierede din e-mail  
**[N]** booking via Fysfinder*

\*Booking via Fysfinder kræver Premium. Opgrader her.

---

## [N] klinikvisninger

Så mange gange blev din klinik vist til potentielle patienter på Fysfinder.

**[N]** visninger i søgeresultater  
**[N]** visninger af din klinikprofil

---

### Få flere patienthenvendelser

En komplet profil på Fysfinder gør det lettere for patienter at vælge jer.

**Opdater din profil nu →**

Har I spørgsmål til dine tal eller profil, er du altid velkomne til at skrive. Jeg svarer selv.

Bedste hilsner  
**Joachim Bograd**  
Fysfinder

---

## Implementering

- HTML/tekst bygges i `src/lib/monthly-clinic-summary-email.ts`
- Job: `scripts/send-monthly-clinic-summary.ts`
- Afmelding: `/api/email/unsubscribe?email=…&token=…`

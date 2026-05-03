# Onboarding-drip: klinik-e-mails (kladder)

Udkast til automatiske e-mails for **klinikejere på Fysfinder**. Mål: hjælpe med profil og relation, senere blød vej mod Premium.

**Tone:** Joachim, enkelt sprog, personligt, nemt at svare tilbage.  
**Brand:** Fysfinder  

---

## Hvor ligger filen?

I repo: `**docs/marketing/onboarding-drip-drafts.md`** (rod: `fysfinder-next`).

I Cursor/Finder: åbn projektmappen **fysfinder-next → docs → marketing → onboarding-drip-drafts.md**.

---

## Hvornår starter drippet? (vigtigt)

**Ikke** ved almindelig bruger-signup. Når nogen opretter en konto, har de typisk **endnu ikke** en klinik på platformen. De skal:

1. **Enten** finde deres klinik og **indsende et claim** (ejerskab), **eller** **oprette en ny klinik** via oprettelsesanmodning.
2. I **begge** tilfælde skal en **administrator godkende** anmodningen.

**Onboarding-drippet (dag 0, 3, 7, 14 …) må først schedules, når brugeren har en godkendt klinik knyttet til kontoen** — dvs. når der reelt findes ejerskab efter godkendelse (i praksis: række i `clinic_owners` for brugerens `user_id`, og klinikken er klar til at blive vist/redigeret som deres).

**Naturlige “start events” i koden (ved implementering):**

- Efter succesfuld `**approveClaim`** — se `src/app/actions/admin-claims.ts` → `approveClaim`.
- Efter succesfuld `**approveClinicCreationRequest`** — samme fil → `approveClinicCreationRequest`.

**Anbefalet adfærd:**

- **Dag 0** = fx **X timer eller 1 kalenderdag efter godkendelse** (så den ikke kolliderer i indbakken med den eksisterende “Din klinik er godkendt”-mail fra Resend).
- Gem et idempotent flag eller scheduled job per bruger/klinik, så drippet ikke startes dobbelt.

---

## Dag 0 — Velkomst + klinikprofil

**Status:** Klar til implementering (tekst nedenfor)  
**Subject:** *Velkommen til Fysfinder* (finaliser ved send)  
**Primær CTA (tekst):** Udfyld jeres klinikprofil nu  
**Primær CTA (URL ved implementering):** `https://www.fysfinder.dk/dashboard` (eller den dybeste direkte “redigér profil”-URL I bruger)

### Brødtekst (plain / Resend)

Hej 👋

Jeg hedder Joachim og står bag Fysfinder.

Som fysioterapeut ved jeg, at tomme tider i kalenderen hurtigt bliver dyre — og at marketing ofte føles uoverskueligt.

Derfor har vi bygget Fysfinder:  
Så patienter, der allerede leder efter behandling i jeres område, nemt kan finde jer — uden at I skal bruge tid på det.

Det vigtigste første skridt er en **udfyldt klinikprofil**.

Det hjælper patienter med at hurtigt forstå:

- hvem I er  
- hvad I hjælper med  
- hvordan de kontakter jer

👉 **Udfyld jeres klinikprofil nu**

Det tager kun få minutter, og gør en reel forskel for, om patienter vælger jer.

Hvis noget driller, så svar bare på denne mail. Jeg hjælper gerne.

Bedste hilsner  
Joachim fra Fysfinder

---

## Dag 3 — Hvad Fysfinder kan betyde for jeres forretning

**Status:** Kladde klar  
**Subject:** *2.500 kr - et tal alle fysser bør kende* (finaliser ved send)  
**Primær CTA (tekst):** Udfyld jeres klinikprofil (hvis I ikke allerede har gjort det)  
**Primær CTA (URL):** Samme som dag 0 — `https://www.fysfinder.dk/dashboard` (eller direkte profil-URL)

### Brødtekst (plain / Resend)

Hej 👋

Joachim fra Fysfinder her.

Jeg vil gerne dele et tal, som viser værdien af nye patienter:

**2.500 kr.**

Så meget er en gennemsnitlig patient værd.

Fysfinder handler ikke bare om synlighed. Vi hjælper jer med at få nye patienter.

Vores mål er konkret:  
**Skaf jer 2–3 nye patienter om måneden**, som allerede leder efter behandling.

Det svarer til ca. **5.000–7.500 kr.** ekstra omsætning om måneden. Og det er kun starten.  
Mange patienter kommer igen eller fortsætter i længere forløb, så værdien vokser over tid.

Det gør en reel forskel over et år.  
Og I kan fokusere på det, I er bedst til: at behandle patienter.

Derfor er jeres profil vigtig.  
Det er ofte det første, en potentiel patient ser.

👉 **Udfyld jeres klinikprofil** (hvis I ikke allerede har gjort det)

Jo tydeligere profilen er, jo større er chancen for, at de kontakter jer.

Skriv endelig, hvis I har spørgsmål. Jeg svarer selv.

Bedste hilsner  
Joachim fra Fysfinder

---

## Dag 7 — Tillid og en kort reminder

**Status:** Kladde klar  
**Subject:** *Bare sig til — jeg læser med* (finaliser ved send)  
**Primær CTA (tekst):** Gå til jeres klinikprofil  
**Primær CTA (URL):** Samme som dag 0 — `https://www.fysfinder.dk/dashboard` (eller direkte profil-URL)

### Brødtekst (plain / Resend)

Hej 👋

Joachim her.

Jeg ville lige skrive, fordi jeg ved, det kan føles mærkeligt at skulle "sælge" sin egen klinik — især når man hellere vil være nede hos patienterne.

På Fysfinder handler det ikke om store annoncebudgetter eller kompliceret SEO. Det handler om, at **folk der allerede leder efter hjælp i jeres område**, kan finde jer uden ekstra bøvl.

De klinikker, der typisk får mest ud af det, er dem, der **holder profilen frisk** — ikke fordi de bruger timer på det, men fordi de lige retter til, når noget ændrer sig.

Har I spørgsmål til formuleringen — eller om Fysfinder overhovedet giver mening for jer — så **skriv endelig på denne mail**. Jeg svarer selv, og der findes ingen dumme spørgsmål.

👉 **Gå til jeres klinikprofil**

Bedste hilsner  
Joachim fra Fysfinder

---

## Dag 14 — *(kladde)*

*(Indhold TBD — fx Premium, når I er klar, lav friktion.)*

---

## Resend — onboarding (dag 0 + 3) *(oprettet via MCP)*

Følgende er **allerede oprettet** i jeres Resend-konto. Automationen er **slået fra** (`disabled`), indtil I har koblet den på backend og slår den til.


| Type                | Navn / beskrivelse                            | ID / link                                                                                                                  |
| ------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Event** (trigger) | `fysfinder.clinic.onboarding_drip_started`    | Event-ID: `019deded-57d4-711e-ba6f-093eadd64153`                                                                           |
| **Skabelon**        | Fysfinder — Onboarding dag 0 (klinikprofil)   | [Template](https://resend.com/templates/d5e4d079-5bcd-4aed-9d99-e29351ef7f22) · `d5e4d079-5bcd-4aed-9d99-e29351ef7f22`     |
| **Skabelon**        | Fysfinder — Onboarding dag 3 (værdi + profil) | [Template](https://resend.com/templates/3fdf8b91-2979-4bcf-bd7e-c8c3a152b1cd) · `3fdf8b91-2979-4bcf-bd7e-c8c3a152b1cd`     |
| **Automation**      | Fysfinder — Klinik onboarding (dag 0 + dag 3) | [Automation](https://resend.com/automations/019dedef-9c49-73c9-b1b4-4750e00ae781) · `019dedef-9c49-73c9-b1b4-4750e00ae781` |


**Forløb:** `send-event` med event-navnet ovenfor → dag 0-mail med det samme → **3 dages delay** → dag 3-mail.

**Subjects & preview (preheader)** — kept in Danish for recipients; English reference for the team:


|           | **Subject line**                          | **Preview text** (inbox snippet; hidden row at top of HTML)                                      |
| --------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Day 0** | `Velkommen til Fysfinder`                 | `Få jeres profil skarp - så patienter forstår jer med det samme.`                                |
| **Day 3** | `2.500 kr - et tal alle fysser bør kende` | `2-3 nye patienter om måneden: se hvad det kan betyde i omsætning - og hvorfor profilen tæller.` |


**Canonical templates in repo:** `docs/marketing/resend-onboarding-day0.html` / `resend-onboarding-day3.html` (HTML) and matching **`resend-onboarding-day0.txt` / `resend-onboarding-day3.txt`** (plain text). **Afmeld:** i automations-skabeloner bruges **`{{{RESEND_UNSUBSCRIBE_URL}}}`** (f.eks. link «Afmeld her»). Push: `PATCH .../templates/{id}` med `html`, `text`, `from` og `reply_to` som under *Fra / reply-to*, derefter `POST .../publish`; `RESEND_API_KEY` i `**.env.local**`. Ved **403 / Cloudflare**: tilføj **`User-Agent`**.

**Fra / reply-to i automation-trin:** `Joachim fra Fysfinder <kontakt@fysfinder.dk>`, reply-to `kontakt@fysfinder.dk` (ret i Resend ved behov).

**Implementering (app + produktion):**

1. **DB:** Migration `supabase/migrations/20260503140000_add_onboarding_drip_started_at.sql` tilføjer `clinic_owners.onboarding_drip_started_at` (idempotens efter succesfuld Resend-event).
2. **Kode:** `approveClaim` og `approveClinicCreationRequest` kalder `triggerClinicOwnerOnboardingDrip` (`src/lib/resend-onboarding-drip.ts`) efter den **transactionelle** godkendelsesmail. Kræver `RESEND_API_KEY` (ellers springes Resend-kaldet over). Valgfrit: `RESEND_ONBOARDING_SEGMENT_IDS` (kommasepareret) til segment-tilknytning på contact create.
3. **Resend-automation:** Efter trigger sendes **dag 0-mail med det samme**, derefter **3 dage** til dag 3. Slå automationen **til** (`enabled`), når I går live med marketing-drip.
4. **Juridisk:** Marketing-samtykke / afmelding for disse mails (respekter `unsubscribed` på kontakter).

---

## Noter til implementering

- **Trigger:** Kun efter godkendt klinik + ejerskab — se *Hvornår starter drippet?*  
- Koordinér med **godkendelsesmailen** (`sendClinicApprovalEmailToUser` i `src/lib/email.ts`).  
- Afsender (marketing): `Joachim fra Fysfinder <kontakt@fysfinder.dk>` på verificeret domæne.  
- Juridisk: samtykke / afmelding for marketing-e-mails.  
- Teknisk: idempotens via `onboarding_drip_started_at` + Resend-automation (delay + send).


# 🐦 Y — Rețea de Socializare

> **Documentul de Specificație a Cerințelor**  
> Versiune: 1.0 | Data: Martie 2026

---

## Cuprins

1. [Introducere](#1-introducere)
   - 1.1 [Scopul documentului](#11-scopul-documentului)
   - 1.2 [Domeniul/Contextul de utilizare al sistemului](#12-domeniulcontextul-de-utilizare-al-sistemului)
   - 1.3 [Lista de definiții și abrevieri](#13-lista-de-definiții-și-abrevieri)
2. [Descriere Generală](#2-descriere-generală)
   - 2.1 [Scurtă descriere a sistemului](#21-scurtă-descriere-a-sistemului)
   - 2.2 [Motivație](#22-motivație)
   - 2.3 [Produse similare](#23-produse-similare)
   - 2.4 [Riscurile proiectului](#24-riscurile-proiectului)
3. [Sistemul Propus](#3-sistemul-propus)
   - 3.1 [Categorii de utilizatori](#31-categorii-de-utilizatori)
   - 3.2 [Cerințe de sistem](#32-cerințe-de-sistem)
   - 3.3 [Cerințe funcționale](#33-cerințe-funcționale)
   - 3.4 [Cerințe nefuncționale](#34-cerințe-nefuncționale)
   - 3.5 [Modele ale sistemului](#35-modele-ale-sistemului)

---

## 1. Introducere

### 1.1 Scopul documentului

Acest document descrie specificațiile cerințelor pentru aplicația mobilă **Y**, o rețea de socializare orientată spre comunitatea din România. Documentul servește ca referință pentru echipa de dezvoltare, managerii de proiect și toți stakeholderii implicați. Scopul său este de a oferi o descriere completă și clară a funcționalităților, constrângerilor și modelelor sistemului, astfel încât să ghideze procesul de proiectare și implementare.

### 1.2 Domeniul/Contextul de utilizare al sistemului

Aplicația **Y** este o platformă mobilă de socializare destinată utilizatorilor din România. Sistemul permite utilizatorilor să publice postări scurte (similare tweet-urilor), să interacționeze prin aprecieri, comentarii și redistribuiri, să urmărească alți utilizatori, să trimită mesaje directe și să descopere conținut nou prin funcția de căutare bazată pe hashtag-uri (#).

Platforma vizează crearea unei comunități digitale locale active, oferind un spațiu de comunicare autentic, în limba română, accesibil de pe dispozitive mobile (iOS și Android).

### 1.3 Lista de definiții și abrevieri

| Termen / Abreviere | Definiție |
|---|---|
| **Y** | Denumirea aplicației mobile de socializare |
| **Post / Postare** | Conținut text (cu opțional media) publicat de un utilizator |
| **Feed** | Fluxul de postări afișate pe ecranul principal al utilizatorului |
| **Hashtag (#)** | Etichetă textuală utilizată pentru categorizarea conținutului |
| **Like / Apreciere** | Reacție pozitivă a unui utilizator față de o postare sau comentariu |
| **Repost / Redistribuire** | Acțiunea de a reshare o postare a altui utilizator |
| **Follow / Urmărire** | Acțiunea de a subscrie la postările unui alt utilizator |
| **DM** | Direct Message — mesaj privat între doi utilizatori |
| **Notificare** | Alertă generată de sistem la o acțiune relevantă pentru utilizator |
| **Profil** | Pagina personală a unui utilizator în aplicație |
| **iOS** | Sistemul de operare mobil al Apple |
| **Android** | Sistemul de operare mobil al Google |
| **API** | Application Programming Interface |
| **JWT** | JSON Web Token — mecanism de autentificare |
| **SRS** | Software Requirements Specification |
| **UC** | Use Case (Caz de utilizare) |

---

## 2. Descriere Generală

### 2.1 Scurtă descriere a sistemului

**Y** este o aplicație mobilă de micro-blogging și socializare, construită în jurul conceptului de comunitate locală românească. Utilizatorii pot crea conturi, publica postări scurte (text, imagine, GIF), interacționa cu conținutul altora (like, comentariu, repost), trimite mesaje directe, urmări alți utilizatori și descoperi conținut prin hashtag-uri și căutare avansată.

Interfața aplicației este în limba română, cu un design modern, curat, bazat pe o paletă de culori albastru-violet, reflectând identitatea vizuală a brandului Y (logoul cu pasărea stilizată în gradient albastru-violet).

**Ecranele principale ale aplicației:**
- 🏠 **Acasă (Feed)** — fluxul de postări al utilizatorilor urmăriți
- 🔍 **Căutare** — descoperire de utilizatori, grupuri și hashtag-uri
- 🔔 **Notificări** — alerte despre activitatea de pe cont
- ✉️ **Mesaje** — conversații directe private
- 👤 **Profil** — pagina personală cu postări, media și like-uri

### 2.2 Motivație

Piața aplicațiilor de socializare este dominată de platforme internaționale (X/Twitter, Instagram, Facebook) care nu sunt adaptate limbii române. Utilizatorii români nu au o platformă nativă, în limba lor, gândită pentru comunitatea locală.

**Y** adresează această nevoie prin:
- **Interfață nativă în română** — terminologie și UX
- **Focus pe comunitate locală** — hashtag-uri locale (#București, #România), grupuri de evenimente locale
- **Design modern și performant** — experiență fluentă pe dispozitive mid-range populare în România
- **Confidențialitate sporită** — date stocate conform GDPR, cu transparență față de utilizatori

### 2.3 Produse similare

| Produs | Asemănări cu Y | Diferențe față de Y |
|---|---|---|
| **X (Twitter)** | Micro-blogging, hashtag-uri, follow, repost | Interfață în engleză, focusat global, algoritm opac |
| **Instagram** | Feed vizual, profil, stories, DM | Focusat pe imagini/video, nu text-first |
| **Facebook** | Grupuri, mesagerie, notificări | Interfață complexă, nu micro-blogging |
| **Mastodon** | Platformă descentralizată, micro-blogging | UI tehnic |
| **Threads** | Micro-blogging integrat cu Meta | Fără hashtag-uri avansate |

**Avantajul competitiv al Y:** Prima platformă de micro-blogging construită pentru utilizatorul român, cu UX optimizat și comunitate locală ca nucleu.

### 2.4 Riscurile proiectului

#### 2.4.1 Riscuri de competiție
- **Risc ridicat:** Platformele mari (Meta, X Corp) pot lansa funcționalități similare sau campanii de retenție agresive.
- **Mitigare:** Focalizare pe nișa locală și funcționalități avansate.

#### 2.4.2 Riscuri de experiență
- **Risc mediu:** Echipa poate avea experiență limitată în dezvoltarea de aplicații mobile la scară largă.
- **Mitigare:** Utilizarea framework-urilor mature (React Native / Flutter), code review riguros, mentoring.

#### 2.4.3 Riscuri de planificare
- **Risc mediu:** Estimările inițiale pot fi depășite din cauza complexității funcționalităților sociale.
- **Mitigare:** Metodologie Agile cu sprint-uri de 2 săptămâni, MVP cu funcționalități critice prioritizate.

#### 2.4.4 Riscuri tehnologice
- **Risc mediu:** Scalabilitatea sistemului la creșterea bazei de utilizatori.
- **Mitigare:** Arhitectură cloud-native cu auto-scaling, CDN pentru media.

#### 2.4.5 Riscuri externe
- **Risc scăzut-mediu:** Modificări legislative privind datele personale (GDPR, legi naționale).
- **Mitigare:** Conformitate GDPR integrată de la proiectare, consultanță juridică periodică.

---

## 3. Sistemul Propus

### 3.1 Categorii de utilizatori

#### 3.1.1 Utilizator înregistrat (User)

| Atribut | Detalii |
|---|---|
| **Denumire** | Utilizator înregistrat |
| **Mod de utilizare** | Creează cont, publică postări, interacționează cu conținut, urmărește utilizatori, trimite/primește mesaje, primește notificări |
| **Competențe necesare** | Utilizare de bază a unui smartphone, cunoașterea limbii române |
| **Număr estimat** | 10.000 – 500.000 utilizatori (în faza de lansare/scalare) |
| **Frecvența accesării** | Zilnică, multiple sesiuni/zi (medie estimată: 3–5 sesiuni/zi, 10–20 min/sesiune) |

#### 3.1.2 Utilizator neautentificat (Vizitator)

| Atribut | Detalii |
|---|---|
| **Denumire** | Vizitator / Guest |
| **Mod de utilizare** | Poate vizualiza profiluri publice și postări publice, fără a putea interacționa |
| **Competențe necesare** | Acces internet de bază |
| **Număr estimat** | Variabil (trafic organic, link-uri partajate) |
| **Frecvența accesării** | Ocazional, mai rar decât utilizatorul înregistrat |

#### 3.1.3 Administrator de sistem (Admin)

| Atribut | Detalii |
|---|---|
| **Denumire** | Administrator |
| **Mod de utilizare** | Moderează conținut, gestionează conturi, vizualizează statistici, configurează platforma |
| **Competențe necesare** | Cunoștințe tehnice și administrative, acces la panoul de administrare web |
| **Număr estimat** | 2–10 persoane |
| **Frecvența accesării** | Zilnică, în funcție de volumul de activitate pe platformă |

#### 3.1.4 Utilizator moderator (Moderator)

| Atribut | Detalii |
|---|---|
| **Denumire** | Moderator comunitate |
| **Mod de utilizare** | Revizuiește raportările de conținut, poate elimina postări necorespunzătoare, gestionează grupuri |
| **Competențe necesare** | Cunoașterea regulamentului platformei |
| **Număr estimat** | 5–50 persoane |
| **Frecvența accesării** | Zilnică sau la cerere |

---

### 3.2 Cerințe de sistem

#### 3.2.1 Dispozitive client (utilizatori finali)
- **Smartphone iOS:** iOS 14.0 sau mai recent, iPhone 8 sau mai recent
- **Smartphone Android:** Android 8.0 (Oreo) sau mai recent, minim 2 GB RAM
- **Conectivitate:** Conexiune la internet (Wi-Fi sau date mobile 4G/5G)
- **Stocare:** Minim 100 MB spațiu disponibil pentru instalarea aplicației

#### 3.2.2 Infrastructură server (back-end)
- **Cloud Provider:** AWS / Google Cloud / Azure (recomandat)
- **Server de aplicații:** Node.js / Python (Django/FastAPI) sau similar
- **Bază de date:** PostgreSQL (date relaționale) + Redis (cache, sesiuni)
- **Stocare media:** AWS S3 sau echivalent (imagini, GIF-uri)
- **CDN:** CloudFront sau similar pentru livrare rapidă a media
- **Autentificare:** JWT + OAuth 2.0

#### 3.2.3 Comunicație în rețea
- **Protocol:** HTTPS (TLS 1.2+) pentru toate comunicațiile
- **API:** REST API sau GraphQL
- **Push Notifications:** Firebase Cloud Messaging (FCM) pentru Android, APNs pentru iOS
- **Real-time messaging:** WebSockets sau similar pentru mesaje directe și notificări live

---

### 3.3 Cerințe funcționale

#### RF-01 — Autentificare și gestionarea contului
- Sistemul trebuie să permită crearea unui cont nou cu email, parolă și username unic.
- Sistemul trebuie să permită autentificarea cu email/parolă.
- Sistemul trebuie să permită recuperarea parolei prin email.
- Sistemul trebuie să permită deconectarea din cont.
- Sistemul trebuie să permită ștergerea contului de către utilizator.

#### RF-02 — Gestionarea profilului
- Utilizatorul trebuie să poată edita numele afișat, biografia, fotografia de profil.
- Sistemul trebuie să afișeze numărul de postări, urmăritori și urmăriți pe pagina de profil.
- Profilul trebuie să aibă tab-uri pentru Postări, Media și Like-uri.

#### RF-03 — Publicarea conținutului
- Utilizatorul trebuie să poată crea o postare text (maxim 280 caractere).
- Utilizatorul trebuie să poată adăuga imagini sau GIF-uri la postare.
- Utilizatorul trebuie să poată adăuga hashtag-uri (#) și menționări (@) în postare.
- Utilizatorul trebuie să poată șterge propriile postări.

#### RF-04 — Feed principal
- Sistemul trebuie să afișeze un feed cu postările utilizatorilor urmăriți, în ordine cronologică sau algoritmică.
- Sistemul trebuie să ofere o opțiune de creare rapidă a unei postări din ecranul principal.

#### RF-05 — Interacțiuni sociale
- Utilizatorul trebuie să poată aprecia (like) o postare sau un comentariu.
- Utilizatorul trebuie să poată comenta la o postare.
- Utilizatorul trebuie să poată redistribui (repost) o postare.
- Utilizatorul trebuie să poată urmări (follow) sau de-urmări (unfollow) un alt utilizator.

#### RF-06 — Căutare și descoperire
- Sistemul trebuie să permită căutarea utilizatorilor după nume sau username.
- Sistemul trebuie să permită căutarea grupurilor și hashtag-urilor.
- Sistemul trebuie să afișeze subiecte populare (trending hashtag-uri).
- Sistemul trebuie să indice statusul online al utilizatorilor în rezultatele căutării.

#### RF-07 — Mesaje directe (DM)
- Utilizatorul trebuie să poată iniția o conversație privată cu alt utilizator.
- Sistemul trebuie să afișeze lista conversațiilor ordonate după cel mai recent mesaj.
- Sistemul trebuie să afișeze statusul de citire al mesajelor.
- Sistemul trebuie să permită căutarea în mesaje.

#### RF-08 — Notificări
- Sistemul trebuie să genereze notificări pentru: like-uri primite, comentarii, repostări, urmăritori noi, aprecieri la comentarii proprii.
- Sistemul trebuie să afișeze un centru de notificări cu istoricul alertelor.
- Sistemul trebuie să permită accesarea conținutului direct din notificare.

#### RF-09 — Moderare și raportare
- Utilizatorul trebuie să poată raporta o postare sau un utilizator.
- Administratorul/Moderatorul trebuie să poată elimina postări raportate.
- Administratorul trebuie să poată suspenda sau dezactiva conturi.

---

### 3.4 Cerințe nefuncționale

#### 3.4.1 Cerințe de performanță
- Timpii de răspuns pentru operațiile principale (încărcare feed, trimitere mesaj) nu trebuie să depășească **2 secunde** în condiții normale de rețea.
- Sistemul trebuie să suporte cel puțin **10.000 utilizatori concurenți** fără degradarea semnificativă a performanței.
- Disponibilitatea sistemului trebuie să fie de minimum **99.5%** (uptime lunar).

#### 3.4.2 Cerințe de securitate
- Toate parolele trebuie stocate hashed (bcrypt sau Argon2).
- Comunicațiile trebuie criptate prin HTTPS/TLS.
- Sesiunile expirate sau revocate trebuie invalidate imediat (JWT cu refresh token).
- Protecție împotriva atacurilor comune: SQL Injection, XSS, CSRF.

#### 3.4.3 Cerințe legislative (GDPR)
- Utilizatorul trebuie să poată solicita exportul datelor personale.
- Utilizatorul trebuie să poată solicita ștergerea completă a datelor (dreptul la uitare).
- Platforma trebuie să prezinte o politică de confidențialitate clară la înregistrare.
- Datele utilizatorilor din UE trebuie stocate pe servere localizate în UE.

#### 3.4.4 Cerințe de utilizabilitate
- Interfața trebuie să fie complet în limba română.
- Aplicația trebuie să respecte principiile de accesibilitate (contrast suficient, text redimensionabil).
- Onboarding-ul (introducere pentru utilizatorii noi) trebuie finalizat în maxim 3 pași.

#### 3.4.5 Cerințe de portabilitate și compatibilitate
- Aplicația trebuie să fie disponibilă pe iOS (App Store) și Android (Google Play Store).
- Interfața trebuie să fie responsivă și funcțională pe ecrane de la 4.7" la 6.9".

#### 3.4.6 Constrângeri hardware/software
- **Client:** Minim 2 GB RAM, Android 8.0+ sau iOS 14.0+
- **Server:** Infrastructură cloud scalabilă (recomandat AWS/GCP)
- **Stocare media:** Imagini comprimate la max 5MB per postare

#### 3.4.7 Cerințe impuse proiectului
- Dezvoltare iterativă (Agile/Scrum), sprint-uri de 2 săptămâni.
- Code review obligatoriu înainte de merge în branch-ul principal.
- Testare automată cu acoperire minimă de 70% pentru back-end.
- Documentație API actualizată la fiecare release.

---

### 3.5 Modele ale sistemului

#### 3.5.1 Actorii și cazurile de utilizare

**Actori:**
- **Utilizator neautentificat (Guest)**
- **Utilizator autentificat (User)**
- **Administrator**
- **Moderator**
- **Sistem de notificări (actor extern)**

**Diagrama cazurilor de utilizare — Overview:**

```
┌─────────────────────────────────────────────────────────┐
│                     Sistemul Y                          │
│                                                         │
│  [Înregistrare cont]         ← Guest, User              │
│  [Autentificare]             ← Guest                    │
│  [Publicare postare]         ← User                     │
│  [Editare profil]            ← User                     │
│  [Urmărire utilizator]       ← User                     │
│  [Like / Comentariu]         ← User                     │
│  [Repost]                    ← User                     │
│  [Trimitere mesaj direct]    ← User                     │
│  [Căutare]                   ← Guest, User              │
│  [Vizualizare notificări]    ← User                     │
│  [Raportare conținut]        ← User                     │
│  [Moderare conținut]         ← Moderator, Admin         │
│  [Gestionare conturi]        ← Admin                    │
└─────────────────────────────────────────────────────────┘
```

---

#### 3.5.2 Descrierea cazurilor de utilizare

---

##### UC-01: Înregistrare cont nou

| Atribut | Detalii |
|---|---|
| **Actor principal** | Utilizator neautentificat (Guest) |
| **Precondiție** | Utilizatorul nu are cont existent pe platformă |
| **Postcondiție** | Contul este creat, utilizatorul este autentificat și redirecționat la feed |
| **Prioritate** | 🔴 Critică |
| **Justificare prioritate** | Fără funcționalitatea de înregistrare, platforma nu poate fi utilizată |

**Flux de bază:**
1. Utilizatorul deschide aplicația și selectează „Creează cont".
2. Sistemul afișează formularul de înregistrare (email, username, parolă).
3. Utilizatorul completează câmpurile și apasă „Înregistrare".
4. Sistemul validează datele (email unic, parolă conformă).
5. Sistemul creează contul și trimite email de confirmare.
6. Utilizatorul confirmă emailul.
7. Sistemul autentifică utilizatorul și afișează feed-ul principal.

**Diagrama de secvență:**
```
Guest          App         Server       Email Service
  |             |              |              |
  |----tap----> |              |              |
  |<----form----|              |              |
  |----date---->|              |              |
  |             |--POST /reg-->|              |
  |             |              |--send email->|
  |             |<----201 OK---|              |
  |<---success--|              |              |
  |--confirm--->|              |              |
  |             |---verify---->|              |
  |             |<----OK-------|              |
  |<----feed----|              |              |
```

**Alternative:**
- **A1 — Email deja utilizat:** Sistemul afișează mesajul „Adresa de email este deja înregistrată" și solicită alt email sau autentificare.
- **A2 — Username indisponibil:** Sistemul sugerează username-uri alternative disponibile.
- **A3 — Parolă slabă:** Sistemul afișează cerințele de parolă și solicită completarea cu o parolă mai puternică.

**Schiță interfață:** Ecran cu logo Y, câmpuri Email / Username / Parolă, buton „Înregistrare" și link „Am deja cont".

---

##### UC-02: Publicare postare

| Atribut | Detalii |
|---|---|
| **Actor principal** | Utilizator autentificat |
| **Precondiție** | Utilizatorul este autentificat în aplicație |
| **Postcondiție** | Postarea apare în feed-ul utilizatorului și al urmăritorilor săi |
| **Prioritate** | 🔴 Critică |
| **Justificare prioritate** | Funcționalitatea core a platformei; fără postări nu există conținut |

**Flux de bază:**
1. Utilizatorul apasă butonul „+" din feed sau bara de navigare.
2. Sistemul afișează editorul de postare.
3. Utilizatorul introduce textul (max 280 caractere) și opțional adaugă imagine/GIF.
4. Utilizatorul adaugă hashtag-uri sau menționări.
5. Utilizatorul apasă „Postează".
6. Sistemul validează conținutul și salvează postarea.
7. Postarea apare în feed-ul propriu și al urmăritorilor.

**Diagrama de secvență:**
```
User             App          Server       Feed Service
  |               |              |               |
  |----tap +----->|              |               |
  |<----editor----|              |               |
  |--text+media-->|              |               |
  |---tap post--->|              |               |
  |               |--POST /post->|               |
  |               |              |--update feed->|
  |               |<---201 OK----|               |
  |<--confirmare--|              |               |
```

**Alternative:**
- **A1 — Text depășește 280 caractere:** Sistemul blochează trimiterea și afișează numărul de caractere depășit.
- **A2 — Imagine prea mare:** Sistemul afișează eroare și solicită o imagine sub 5MB.
- **A3 — Conținut ofensator detectat:** Sistemul avertizează utilizatorul și blochează postarea.

**Schiță interfață:** Modal/ecran full cu avatar utilizator, textarea cu contor caractere, iconițe pentru adăugare imagine/GIF/locație, buton „Postează".

---

##### UC-03: Urmărire utilizator

| Atribut | Detalii |
|---|---|
| **Actor principal** | Utilizator autentificat |
| **Precondiție** | Utilizatorul vizualizează profilul altui utilizator |
| **Postcondiție** | Utilizatorul urmărește contul selectat; postările acestuia apar în feed |
| **Prioritate** | 🔴 Critică |
| **Justificare prioritate** | Funcționalitate esențială pentru construirea rețelei sociale |

**Flux de bază:**
1. Utilizatorul accesează profilul unui alt utilizator (din feed, căutare sau notificări).
2. Sistemul afișează profilul cu butonul „Urmărește".
3. Utilizatorul apasă „Urmărește".
4. Sistemul creează relația de urmărire.
5. Utilizatorul urmărit primește notificare „[username] a început să te urmărească".
6. Butonul devine „Urmărești" (posibilitate de de-urmărire).

**Alternative:**
- **A1 — Cont privat:** Sistemul trimite o cerere de urmărire; butonul devine „Cerere trimisă" până la aprobare.
- **A2 — De-urmărire:** Utilizatorul apasă „Urmărești" și confirmă de-urmărirea.

**Schiță interfață:** Pagina de profil cu buton „Urmărește" (albastru) / „Urmărești" (contur) alături de statistici.

---

##### UC-04: Trimitere mesaj direct

| Atribut | Detalii |
|---|---|
| **Actor principal** | Utilizator autentificat |
| **Precondiție** | Utilizatorul este autentificat; destinatarul există pe platformă |
| **Postcondiție** | Mesajul este livrat destinatarului; conversația apare în lista de mesaje a ambilor |
| **Prioritate** | 🟠 Ridicată |
| **Justificare prioritate** | Funcționalitate importantă pentru comunicare privată, dar non-blocantă pentru MVP |

**Flux de bază:**
1. Utilizatorul navighează la tab-ul „Mesaje".
2. Apasă „+" pentru conversație nouă sau selectează o conversație existentă.
3. Sistemul afișează fereastra de chat.
4. Utilizatorul introduce mesajul și apasă „Trimite".
5. Sistemul livrează mesajul în timp real prin WebSocket.
6. Destinatarul primește notificare push (dacă nu este activ în conversație).

**Alternative:**
- **A1 — Utilizatorul nu urmărește destinatarul:** Sistemul verifică setările de intimitate; dacă destinatarul acceptă mesaje de la oricine, permite trimiterea; altfel, afișează eroare.
- **A2 — Conexiune pierdută:** Mesajul este marcat ca „în așteptare" și retrimis la reconectare.

**Schiță interfață:** Lista conversațiilor cu avatar, nume, preview mesaj și timestamp; ecranul de chat cu bule de mesaj și câmp de introducere text.

---

##### UC-05: Căutare utilizatori și hashtag-uri

| Atribut | Detalii |
|---|---|
| **Actor principal** | Utilizator autentificat / Vizitator |
| **Precondiție** | Aplicația este deschisă |
| **Postcondiție** | Rezultatele relevante sunt afișate; utilizatorul poate accesa profilurile sau hashtag-urile găsite |
| **Prioritate** | 🟠 Ridicată |
| **Justificare prioritate** | Esențială pentru descoperirea conținutului și a altor utilizatori |

**Flux de bază:**
1. Utilizatorul navighează la tab-ul „Căutare".
2. Sistemul afișează câmpul de căutare și secțiunile „Oameni și Grupuri" și „Subiecte Populare".
3. Utilizatorul introduce un termen de căutare.
4. Sistemul returnează rezultate în timp real (utilizatori, grupuri, hashtag-uri).
5. Utilizatorul selectează un rezultat și accesează profilul sau pagina de hashtag.

**Alternative:**
- **A1 — Niciun rezultat:** Sistemul afișează mesajul „Nu am găsit rezultate pentru [termen]" și sugerează hashtag-uri populare.
- **A2 — Căutare după hashtag:** Sistemul afișează toate postările cu hashtag-ul respectiv, ordonate cronologic.

**Schiță interfață:** Ecranul de căutare cu bară de search, rezultate grupate pe categorii, badge „Online" lângă utilizatorii activi, butoane „Urmărește" în rezultate.

---

##### UC-06: Vizualizare și gestionare notificări

| Atribut | Detalii |
|---|---|
| **Actor principal** | Utilizator autentificat |
| **Precondiție** | Utilizatorul este autentificat și a generat activitate pe platformă |
| **Postcondiție** | Notificările sunt marcate ca citite; utilizatorul poate naviga la conținutul relevant |
| **Prioritate** | 🟡 Medie |
| **Justificare prioritate** | Importantă pentru engagement, dar nu blocantă pentru funcționalitatea de bază |

**Flux de bază:**
1. Utilizatorul navighează la tab-ul „Notificări" (cu badge pentru numărul necitite).
2. Sistemul afișează lista notificărilor ordonate cronologic (like-uri, comentarii, repostări, urmăritori noi).
3. Utilizatorul apasă o notificare.
4. Sistemul navighează la conținutul relevant (postarea, profilul).
5. Notificarea este marcată ca citită.

**Alternative:**
- **A1 — Ștergere notificare:** Utilizatorul poate swipe-left pe o notificare pentru a o șterge.
- **A2 — Marcare toate ca citite:** Buton în header pentru resetarea badge-ului.

**Schiță interfață:** Listă cu avatar, icon tip notificare (inimă/comentariu/repost/persoană), text descriptiv și thumbnail postare unde e relevant.

---

#### 3.5.3 Diagrama de context

```
                         ┌───────────────────┐
                         │                   │
    Utilizator ─────────►|                   ├────────── Email Service
    (autentificat)       │                   │           (confirmare cont,
                         │    SISTEMUL Y     │            recuperare parolă)
    Vizitator ──────────►|    (Aplicație     │
    (neautentificat)     │     mobilă +      ├────────── Push Notification
                         │     back-end)     │           Service (FCM/APNs)
    Administrator ──────►|                   │
                         │                   ├────────── CDN / Media Storage
    Moderator ──────────►|                   │           (imagini, GIF-uri)
                         │                   │
                         └───────────────────┘
                                 │
                                 │
                          Cloud Database
                       (PostgreSQL + Redis)
```

**Descrierea fluxurilor principale de date:**
- **Utilizator → Sistem:** Postări, mesaje, acțiuni sociale (like, follow), date de profil
- **Sistem → Utilizator:** Feed personalizat, notificări, mesaje primite, rezultate căutare
- **Sistem → Email Service:** Emailuri de confirmare cont și recuperare parolă
- **Sistem → Push Notification Service:** Notificări push pentru interacțiuni și mesaje noi
- **Sistem → CDN/Media Storage:** Upload și servire imagini/GIF-uri din postări și profiluri

---

## Anexe

### Anexa A — Schițe UI (Mockup-uri)

Aplicația Y dispune de o interfață modernă, cu fundal alb/gri deschis și accente în albastru-violet (gradient `#4FC3F7` → `#7C4DFF`). Navigarea se realizează prin bara de jos cu 5 tab-uri: **Acasă, Căutare, Notificări, Mesaje, Profil**.

### Anexa B — Tehnologii folisite

| Componentă         | Tehnologie folosita                     |
|                    |                                         |
| Mobile App         | React Native / Flutter                  |
| Back-end API       | Node.js (Express) sau Python (FastAPI)  |
| Bază de date       | PostgreSQL + Redis                      |
| Stocare media      | AWS S3 + CloudFront                     |
| Autentificare      | JWT + OAuth 2.0                         |
| Real-time          | WebSockets (Socket.io)                  |
| Push notifications | Firebase Cloud Messaging                |
| CI/CD              | GitHub Actions                          |

---

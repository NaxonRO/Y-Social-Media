# Tutorial — Rulare & Testare Y Social Media (Sprint 1)

## Cuprins
1. [Prerequisite](#1-prerequisite)
2. [Setup PostgreSQL](#2-setup-postgresql)
3. [Setup Redis](#3-setup-redis)
4. [Setup Backend](#4-setup-backend)
5. [Rulare teste automate](#5-rulare-teste-automate)
6. [Testare manuală cu curl / REST client](#6-testare-manuala-cu-curl--rest-client)
7. [Setup Mobile (Expo)](#7-setup-mobile-expo)
8. [Verificare securitate](#8-verificare-securitate)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisite

Instalează înainte:

| Tool | Versiune minimă | Instalare |
|---|---|---|
| Node.js | 20.x | https://nodejs.org |
| npm | 10.x | vine cu Node.js |
| PostgreSQL | 14+ | vezi secțiunea 2 |
| Redis | 7+ | vezi secțiunea 3 |
| Git | orice | https://git-scm.com |

Verificare:
```bash
node -v       # v20.x.x
npm -v        # 10.x.x
psql --version
redis-cli --version
```

---

## 2. Setup PostgreSQL

### Opțiunea A — Docker (recomandat, cel mai simplu)
```bash
docker run -d --name y-postgres \
  -e POSTGRES_DB=y_social_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 \
  postgres:16-alpine

# Creează și baza de test
docker exec y-postgres psql -U postgres -c "CREATE DATABASE y_social_test;"

# Verificare
docker exec y-postgres pg_isready -U postgres
```

> **Notă:** Portul local este **5433** (nu 5432) pentru a nu intra în conflict cu PostgreSQL-ul de sistem.
> Asigură-te că `.env` are `DB_PORT=5433`.

### Opțiunea B — PostgreSQL nativ (Ubuntu/Debian)
```bash
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres psql <<'SQL'
CREATE DATABASE y_social_dev;
CREATE DATABASE y_social_test;
SQL
```

---

## 3. Setup Redis

### Opțiunea A — Docker (recomandat)
```bash
docker run -d --name y-redis -p 6379:6379 redis:7-alpine

# Verificare
redis-cli ping   # PONG
```

### Opțiunea B — Redis nativ (Ubuntu/Debian)
```bash
sudo apt update && sudo apt install redis-server
sudo service redis-server start
redis-cli ping   # PONG
```

---

## 4. Setup Backend

```bash
cd backend

# Copiază fișierul de configurare
cp .env.example .env
```

Editează `.env` — valorile implicite funcționează pentru dev local:
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=y_social_dev
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_ACCESS_SECRET=un-secret-lung-minim-32-caractere-schimba-asta
JWT_REFRESH_SECRET=alt-secret-lung-minim-32-caractere-schimba-asta
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# SendGrid e opțional — fără el, link-urile apar în consolă
SENDGRID_API_KEY=
EMAIL_FROM=noreply@y-social.ro

FRONTEND_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3001
```

```bash
# Instalează dependințele
npm install

# Rulează migrările (creează tabelele users și sessions)
npm run db:migrate

# Pornește serverul în mod development (hot-reload)
npm run dev
```

Ar trebui să vezi:
```
✓ PostgreSQL connected
✓ Redis connected
✓ Server running on port 3000 (development)
```

### Verificare health check
```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"2026-04-21T..."}
```

---

## 5. Rulare Teste Automate

Testele sunt **integration tests** — au nevoie de PostgreSQL și Redis pornite.

```bash
cd backend

# Asigură-te că există baza de date de test
psql -h localhost -U postgres -c "CREATE DATABASE y_social_test;" 2>/dev/null || true

# Rulează migrările pe baza de test
DB_NAME=y_social_test npm run db:migrate

# Rulează toate testele
npm test

# Cu raport coverage
npm run test:coverage
```

### Output așteptat
```
PASS tests/authController.test.ts
  POST /api/v1/auth/register
    ✓ should register a new user and return tokens
    ✓ should reject duplicate email with 409
    ✓ should reject duplicate username with 409
    ✓ should reject invalid email with 422
    ✓ should reject short password with 422
    ✓ should reject short username with 422
  POST /api/v1/auth/login
    ✓ should login with valid credentials
    ✓ should reject wrong password with 401
    ✓ should reject non-existent email with 401
  POST /api/v1/auth/refresh
    ✓ should return new token pair with valid refresh token
    ✓ should reject invalid refresh token with 401
    ✓ should reject missing refresh token with 422
  POST /api/v1/auth/logout
    ✓ should logout successfully and blacklist the access token
    ✓ should reject unauthenticated logout with 401
  POST /api/v1/auth/forgot-password
    ✓ should return 200 for existing email
    ✓ should return 200 for non-existent email (no enumeration)
    ✓ should reject invalid email format with 422
  GET /api/v1/users/me
    ✓ should return current user profile with valid token
    ✓ should reject unauthenticated request with 401
  GET /api/v1/users/:id
    ✓ should return public user profile
    ✓ should return 404 for non-existent user

Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
```

---

## 6. Testare Manuală cu curl / REST Client

Serverul trebuie să ruleze pe `http://localhost:3000`.

> **Tip:** Poți folosi și [Postman](https://postman.com), [Insomnia](https://insomnia.rest) sau extensia **REST Client** din VS Code în loc de curl.

---

### 6.1 Înregistrare cont nou

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@exemplu.ro",
    "username": "utilizatortest",
    "password": "Parola123!"
  }'
```

**Răspuns așteptat (201):**
```json
{
  "success": true,
  "message": "Cont creat cu succes. Verifică emailul pentru confirmare.",
  "data": {
    "user": {
      "id": "uuid-generat",
      "email": "test@exemplu.ro",
      "username": "utilizatortest",
      "is_verified": false,
      ...
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

> Dacă nu ai SendGrid configurat, link-ul de verificare apare în consola serverului.

---

### 6.2 Autentificare

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@exemplu.ro",
    "password": "Parola123!"
  }'
```

**Salvează tokenurile** din răspuns — le vei folosi mai jos:
```bash
ACCESS_TOKEN="eyJ..."   # copiază din răspuns
REFRESH_TOKEN="eyJ..."  # copiază din răspuns
```

---

### 6.3 Profil propriu (rută protejată)

```bash
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

### 6.4 Profil public după ID

```bash
# Înlocuiește UUID-ul cu cel din răspunsul de la register/login
curl http://localhost:3000/api/v1/users/uuid-generat
```

> **Diferență față de /me:** `/users/:id` nu returnează email-ul sau date private.

---

### 6.5 Refresh token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

Vei primi un **access token nou** și un **refresh token nou** (rotație automată).

---

### 6.6 Recuperare parolă

```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@exemplu.ro"}'
```

Răspunsul este mereu 200, chiar dacă emailul nu există — protecție anti-enumerare.

---

### 6.7 Logout

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

---

### 6.8 Verificare blacklist (după logout)

```bash
# Încearcă să accesezi /me cu același token — trebuie să primești 401
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
# {"success":false,"message":"Token invalid"}
```

---

### 6.9 Testare validări

```bash
# Parolă prea scurtă
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "x@x.com", "username": "test123", "password": "123"}'
# 422 + {"errors": {"password": "Parola trebuie să aibă cel puțin 8 caractere"}}

# Email invalid
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "nu-e-email", "username": "test123", "password": "Parola123!"}'
# 422 + {"errors": {"email": "Adresa de email nu este validă"}}
```

---

## 7. Setup Mobile (Expo)

### Prerequisite suplimentare
```bash
npm install -g expo-cli        # sau folosești npx expo direct
```

Pentru a rula pe telefon: instalează **Expo Go** din App Store / Google Play.

```bash
cd mobile
npm install

# Pornește serverul Expo
npx expo start
```

Se deschide Expo Dev Tools în browser. Scanează QR code-ul cu Expo Go.

### Configurare URL API

Editează [mobile/app.json](mobile/app.json) și setează IP-ul mașinii tale (nu `localhost` — telefonul trebuie să ajungă la server):

```json
"extra": {
  "apiUrl": "http://192.168.X.X:3000/api/v1"
}
```

Sau setează variabila de mediu:
```bash
EXPO_PUBLIC_API_URL=http://192.168.X.X:3000/api/v1 npx expo start
```

### Fluxuri de testat în aplicație
1. **Sign Up** → completează email, username, parolă → apasă "Creează cont" → redirect la Home
2. **Sign In** → loghează-te cu contul creat → redirect la Home
3. **Forgot Password** → introdu email → pagina de confirmare
4. **Logout** → butonul "Ieși" din Home → redirect la Sign In
5. **Erori** → încearcă email invalid / parolă scurtă → mesaje de eroare inline

---

## 8. Verificare Securitate

### Parole hashed cu bcrypt
```bash
psql -h localhost -U postgres -d y_social_dev -c \
  "SELECT email, LEFT(password_hash, 10) as hash_preview FROM users LIMIT 3;"
# hash_preview: $2b$12$... — bcrypt cu cost 12
```

### JWT funcțional
```bash
# Decodifică access token (payload vizibil, semnătura protejată)
echo $ACCESS_TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | python3 -m json.tool
# {"sub": "uuid", "email": "...", "type": "access", "exp": ...}
```

### Redis blacklist operațional
```bash
# După logout, verifică că tokenul e în blacklist
redis-cli KEYS "blacklist:*"
# blacklist:eyJ...   <- tokenul invalidat

# TTL-ul expiră automat
redis-cli TTL "blacklist:eyJ..."
# număr de secunde rămase
```

### Sesiuni active în DB
```bash
psql -h localhost -U postgres -d y_social_dev -c \
  "SELECT user_id, LEFT(refresh_token, 20) as token_preview, expires_at, revoked_at FROM sessions;"
```

---

## 9. Troubleshooting

### `Error: connect ECONNREFUSED 127.0.0.1:5432`
PostgreSQL nu rulează:
```bash
sudo service postgresql start
```

### `Error: connect ECONNREFUSED 127.0.0.1:6379`
Redis nu rulează:
```bash
sudo service redis-server start
```

### `relation "users" does not exist`
Migrările nu au rulat:
```bash
npm run db:migrate
```

### `JWT_ACCESS_SECRET must be at least 32 characters`
Editează `.env` și pune un secret mai lung.

### `duplicate key value violates unique constraint "users_email_key"`
Emailul e deja înregistrat — folosește altul sau șterge:
```bash
psql -h localhost -U postgres -d y_social_dev -c \
  "DELETE FROM users WHERE email = 'test@exemplu.ro';"
```

### Expo: `Network request failed`
Telefonul nu ajunge la server. Verifică:
- Serverul rulează (`npm run dev`)
- Folosești IP-ul mașinii, nu `localhost`
- Firewall-ul permite portul 3000

---

## Rezumat comenzi rapide

```bash
# Backend
cd backend && npm run dev          # pornire server
cd backend && npm test             # teste automate
cd backend && npm run db:migrate   # aplică migrări
cd backend && npm run lint         # verificare cod

# Mobile
cd mobile && npx expo start        # pornire app
```

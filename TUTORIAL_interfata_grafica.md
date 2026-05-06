# Tutorial — Pornire completă Y Social Media (interfața grafică)

> Rulează comenzile în ordine, de fiecare dată când pornești PC-ul.

---

## PASUL 1 — Pornește Docker (PostgreSQL + Redis)

Deschide **WSL / Terminal Ubuntu** și rulează:

```bash
docker start y_social_db y_social_redis
```

Verifică că rulează:

```bash
docker ps
```

Trebuie să vezi ceva de genul:
```
NAMES            STATUS    PORTS
y_social_redis   Up ...    0.0.0.0:6379->6379/tcp
y_social_db      Up ...    0.0.0.0:5433->5432/tcp
```

> **Dacă apare eroare "No such container"** înseamnă că ai șters containerele.  
> Rulează comenzile de creare de mai jos, apoi treci la Pasul 2:
>
> ```bash
> docker run -d --name y_social_db \
>   -e POSTGRES_DB=y_social_dev \
>   -e POSTGRES_USER=postgres \
>   -e POSTGRES_PASSWORD=postgres \
>   -p 5433:5432 \
>   postgres:16-alpine
>
> docker run -d --name y_social_redis \
>   -p 6379:6379 \
>   redis:7-alpine
>
> # Asteapta 3 secunde, apoi ruleaza migrarile
> sleep 3
> cd ~/communityProject/Y-Social-Media/backend && npm run db:migrate
> ```

---

## PASUL 2 — Pornește backend-ul

În **WSL / Terminal Ubuntu**:

```bash
cd ~/communityProject/Y-Social-Media/backend
npm run dev
```

Trebuie să apară:
```
✓ PostgreSQL connected
✓ Redis connected
✓ Server running on port 3000 (development)
```

> Lasă acest terminal deschis. Deschide un terminal nou pentru pasul următor.

---

## PASUL 3 — Pornește aplicația mobilă / web

Deschide un **terminal nou în WSL** și rulează:

```bash
cd ~/communityProject/Y-Social-Media/mobile
npx expo start --lan
```

Vei vedea un QR code și mesajul:
```
Metro waiting on exp://172.23.38.179:8081
Web is waiting on http://localhost:8081
```

### Pe browser (web)
Apasă tasta **`w`** în terminal — se deschide automat `http://localhost:8081` în browser.

### Pe telefon (Android)
Continuă cu **Pasul 4**.

---

## PASUL 4 — Port forwarding pentru telefon (o dată per sesiune Windows)

> Fă asta de fiecare dată când repornești PC-ul și vrei să accesezi aplicația de pe telefon.

Deschide **PowerShell ca Administrator** pe Windows (click dreapta → Run as Administrator) și rulează blocul de mai jos **dintr-o singură dată**:

```powershell
# Gaseste IP-ul WSL2 automat
$wslIp = (wsl hostname -I).Trim().Split(" ")[0]

# Sterge regulile vechi (daca exista) ca sa nu se dubleze
netsh interface portproxy delete v4tov4 listenport=8081 listenaddress=0.0.0.0 2>$null
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0 2>$null

# Adauga porturile noi
netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIp

# Permite porturile prin firewall
netsh advfirewall firewall add rule name="Expo 8081" dir=in action=allow protocol=TCP localport=8081 2>$null
netsh advfirewall firewall add rule name="Y Social API 3000" dir=in action=allow protocol=TCP localport=3000 2>$null

# Afiseaza IP-ul Windows pe WiFi
Write-Host ""
Write-Host "==================================="
Write-Host "WSL2 IP: $wslIp"
Write-Host "IP-ul tau Windows (WiFi):"
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
  $_.PrefixOrigin -eq "Dhcp"
}).IPAddress
Write-Host "==================================="
```

Reține **IP-ul Windows pe WiFi** afișat (ex: `192.168.X.X`).

### Conectare telefon

1. Instaleaza **Expo Go** din Play Store (dacă nu ai deja)
2. Deschide Expo Go → apasă **"Enter URL manually"**
3. Scrie: `exp://[ce este de la windows]:8081` *(înlocuiește cu IP-ul tău afișat mai sus)*
4. Apasă Enter — aplicația se încarcă pe telefon

---

## PASUL 5 — Creare cont / Autentificare

### Creare cont nou
1. La pornire apare ecranul **"Intră în cont"**
2. Apasă **"Înregistrează-te"**
3. Completează:
   - **Email:** orice adresă validă (ex: `andrei@test.ro`)
   - **Username:** alfanumeric, fără spații (ex: `andrei123`)
   - **Parolă:** minim 8 caractere
4. Apasă **"Creează cont"** → intri direct în feed

### Autentificare cont existent
1. Introdu **email** și **parolă**
2. Apasă **"Intră în cont"**

---

## PASUL 6 — Oprire la final

Când termini lucrul:

```bash
# In terminalul cu backend: Ctrl+C

# Opreste containerele Docker (optional, le poti lasa rulate)
docker stop y_social_db y_social_redis
```

---

## Rezumat comenzi rapide (cheat sheet)

```bash
# 1. Docker
docker start y_social_db y_social_redis

# 2. Backend (terminal 1)
cd ~/communityProject/Y-Social-Media/backend && npm run dev

# 3. Mobile/Web (terminal 2)
cd ~/communityProject/Y-Social-Media/mobile && npx expo start --lan

# 4. Web → apasa 'w' in terminal sau deschide http://localhost:8081
# 5. Telefon → port forwarding in PowerShell (vezi Pasul 4)
```

---

## Probleme frecvente

| Problemă | Soluție |
|----------|---------|
| `ECONNREFUSED` la backend | Docker nu rulează → `docker start y_social_db y_social_redis` |
| QR code nu merge pe telefon | Rulează comenzile din Pasul 4 în PowerShell ca Administrator |
| `Incompatible SDK` în Expo Go | Asigură-te că ai Expo Go SDK 54 din Play Store |
| Pagina web e goală / erori | Apasă `r` în terminalul Expo pentru reload |
| Uitați parola / cont blocat | Rulează în WSL: `docker exec y_social_db psql -U postgres -d y_social_dev -c "TRUNCATE TABLE sessions, users RESTART IDENTITY CASCADE;"` |

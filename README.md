# 🏫 WebUntis Discord Notification Bot

Ein leistungsstarker **Node.js-Bot**, der den WebUntis-Stundenplan deiner Schule auf Entfälle prüft und dich sofort via **Discord** benachrichtigt.  

Der Bot ist speziell auf die Nutzung von **A/B-Wochen** und den Abgleich mit einem persönlichen Stundenplan optimiert.

---

## ✨ Features

### ✅ Präzise Überprüfung  
Gleicht WebUntis-Entfälle mit deiner persönlichen `meine_stunden.json` ab –  
Alarme gibt es **nur für Stunden, die du auch wirklich hättest**.

### 🔄 A/B-Wochen Support  
Berechnet automatisch die aktuelle Woche (A oder B) für den korrekten Plan.

### ⏱ Intelligentes Intervall  
Prüft **Montag–Freitag alle 15 Minuten** (zwischen 07:00 und 20:00 Uhr).

### 🌅 Status-Updates  
- Nachricht beim Bot-Start  
- Täglicher Morgengruß um 07:00 Uhr  

### 🚨 Discord Error Reporting  
Fehlermeldungen (z. B. Login-Probleme) werden direkt in deinen Discord-Kanal gesendet.

### 🐳 Docker Ready  
Vollständig vorbereitet für den Betrieb mit **Docker & Docker Compose**.

---

# 🛠 Setup

## 1️⃣ Repository klonen

```bash
git clone https://github.com/TheBeneCraft/webuntisbot.git
cd webuntisbot
```

---

## 2️⃣ Abhängigkeiten installieren

```bash
npm install
```

---

## 3️⃣ Konfiguration (.env)

Erstelle eine `.env` Datei im Hauptverzeichnis und fülle sie mit deinen Daten:

```env
DISCORD_TOKEN=dein_discord_bot_token
DISCORD_CHANNEL_ID=dein_channel_id
UNTIS_SERVER=marienschule-saarbruecken.webuntis.com
UNTIS_SCHOOL=Marienschule
UNTIS_USER=dein_benutzername
UNTIS_PASSWORD=dein_passwort
```

⚠ **Wichtig:**  
Gib deine `.env` niemals weiter und lade sie nicht auf GitHub hoch!

---

## 4️⃣ Stundenplan anpassen (`meine_stunden.json`)

Trage deine Fächer in die `meine_stunden.json` ein.  
Der Bot meldet nur Entfälle für Zeiten, in denen bei `subject` ein Fach steht.

```json
{
  "A": {
    "Montag": [
      { "start": "08:00", "end": "08:45", "subject": "MATHE", "teacher": "M1" }
    ]
  },
  "B": {
    "Montag": [
      { "start": "08:00", "end": "08:45", "subject": "", "teacher": "" }
    ]
  }
}
```

---

# 🚀 Starten

## ▶ Lokal ausführen

```bash
node index.js
```

---

## 🐳 Mit Docker (Empfohlen)

Der Bot wird vorkonfiguriert mit der Zeitzone `Europe/Berlin` gestartet.

### Image bauen & starten

```bash
docker-compose up -d --build
```

### Logs einsehen

```bash
docker-compose logs -f
```

---

# 📁 Projektstruktur

```
.
├── index.js           # Hauptskript des Bots
├── meine_stunden.json # Dein persönlicher Zeitplan (A/B Wochen)
├── Dockerfile         # Docker Image Konfiguration
├── docker-compose.yml # Docker Service Definition
├── package.json       # Node.js Abhängigkeiten
└── .env               # Umgebungsvariablen (nicht im Git!)
```

---

# 🔒 Sicherheit & Hinweise

### 🔁 Token Reset  
Falls dein Discord-Token jemals öffentlich wurde, resette ihn sofort im Discord Developer Portal.

### 🔑 Berechtigungen  
Der Bot benötigt folgende Berechtigungen im Ziel-Kanal:
- View Channels  
- Send Messages  

### 📊 API-Limit  
Das 15-Minuten-Intervall ist so gewählt, dass die WebUntis-Server nicht überlastet werden.

---

# 📄 Lizenz

Dieses Projekt steht unter der **MIT License**.

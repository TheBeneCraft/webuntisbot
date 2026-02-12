# 1. Nutze Node.js LTS (leichtgewichtige Alpine Version)
FROM node:20-alpine

# 2. Zeitzone auf Berlin setzen (Wichtig für die Cron-Uhrzeiten!)
RUN apk add --no-cache tzdata
ENV TZ=Europe/Berlin

# 3. Arbeitsverzeichnis im Container festlegen
WORKDIR /app

# 4. package.json und package-lock.json kopieren
COPY package*.json ./

# 5. Abhängigkeiten installieren
RUN npm install

# 6. Den restlichen Code kopieren
COPY . .

# 7. Startbefehl
CMD ["node", "index.js"]
import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch"; 
import { format, getWeek } from "date-fns";
import cron from "node-cron";
import fs from "fs";
import "dotenv/config";

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const JSON_FILE = "./meine_stunden.json";

class WebUntisAPI {
    constructor() {
        this.baseUrl = `https://${process.env.UNTIS_SERVER}/WebUntis/jsonrpc.do?school=${process.env.UNTIS_SCHOOL}`;
        this.sessionId = null;
        this.requestId = 0;
    }

    async _makeRequest(method, params = {}) {
        const payload = { id: (this.requestId++).toString(), method, params, jsonrpc: "2.0" };
        try {
            const res = await fetch(this.baseUrl, { 
                method: "POST", 
                headers: { "Content-Type": "application/json", "Cookie": this.sessionId ? `JSESSIONID=${this.sessionId}` : "" }, 
                body: JSON.stringify(payload) 
            });
            const data = await res.json();
            return data.result || {};
        } catch (e) { return {}; }
    }

    async login() {
        const res = await this._makeRequest("authenticate", { user: process.env.UNTIS_USER, password: process.env.UNTIS_PASSWORD, client: "NodeJSBot" });
        this.sessionId = res.sessionId;
    }

    async getKlassen() { return await this._makeRequest("getKlassen"); }
    async getTimetable(id, type, date) {
        const d = format(date, "yyyyMMdd");
        return await this._makeRequest("getTimetable", { id, type, startDate: parseInt(d), endDate: parseInt(d) });
    }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const gesendeteEntfaelle = new Set();

const formatTime = (timeInt) => (timeInt || 0).toString().padStart(4, "0").replace(/(\d{2})(\d{2})/, "$1:$2");
const getABWoche = (date) => (getWeek(date) % 2 === 0 ? "A" : "B");
const getWochentagDE = (date) => ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][date.getDay()];

async function checkEntfall(zielDatum) {
    const api = new WebUntisAPI();
    try {
        if (!fs.existsSync(JSON_FILE)) return;
        const meinPlan = JSON.parse(fs.readFileSync(JSON_FILE, "utf-8"));
        const woche = getABWoche(zielDatum);
        const tag = getWochentagDE(zielDatum);
        const meineStunden = meinPlan[woche]?.[tag] || [];

        await api.login();
        const klassen = await api.getKlassen();
        const klasse11 = klassen.find(k => k.name === "11");
        if (!klasse11) return;

        const timetable = await api.getTimetable(klasse11.id, 1, zielDatum);
        const channel = await client.channels.fetch(CHANNEL_ID);

        const entfaelle = timetable.filter(stunde => {
            const istEntfall = stunde.code === "cancelled" || stunde.cellState === "CANCEL";
            const start = formatTime(stunde.startTime);
            return istEntfall && meineStunden.some(s => s.start === start && s.subject !== "");
        });

        for (const stunde of entfaelle) {
            const stundenId = `${stunde.date}_${stunde.startTime}`;
            if (!gesendeteEntfaelle.has(stundenId)) {
                const start = formatTime(stunde.startTime);
                const fachInfo = meineStunden.find(s => s.start === start)?.subject || "Unbekannt";
                await channel.send(`⚠️ **ENTFALL-ALARM (${format(zielDatum, "dd.MM.")})** ⚠️\nDeine Stunde **${fachInfo}** um **${start} Uhr** fällt aus!`);
                gesendeteEntfaelle.add(stundenId);
            }
        }
    } catch (e) { console.error("Check-Fehler:", e); }
}

client.once("ready", async () => {
    console.log(`✅ Bot online als ${client.user.tag}`);
    const channel = await client.channels.fetch(CHANNEL_ID);
    
    // 1. NACHRICHT BEIM START
    if (channel) await channel.send("🤖 **Bot wurde gestartet und ist nun aktiv!** Ich prüfe ab jetzt regelmäßig deinen Plan.");

    // 2. GUTEN MORGEN NACHRICHT (Mo-Fr um 07:00)
    cron.schedule("0 7 * * 1-5", async () => {
        await channel.send("☀️ **Guten Morgen!** Ich starte die Überprüfung für heute.");
    });

    // 3. ALLE 15 MINUTEN CHECKEN (Mo-Fr, 07:00 bis 20:00)
    // Cron: "0,15,30,45" (Minuten) "7-20" (Stunden)
    cron.schedule("0,15,30,45 7-20 * * 1-5", () => {
        console.log("🔍 Automatischer 15-Minuten-Check läuft...");
        checkEntfall(new Date()); // Check für heute
    });
});

client.login(TOKEN);
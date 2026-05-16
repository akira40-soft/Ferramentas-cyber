/**
 * ═══════════════════════════════════════════════════════════════════════
 * CLASSE: BotCore (Ferramentas-cyber)
 * ═══════════════════════════════════════════════════════════════════════
 */

import * as Baileys from '@whiskeysockets/baileys';
const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} = Baileys as any;

const makeWASocket = (Baileys as any).default ?? (Baileys as any).makeWASocket;

import pino from 'pino';
import ConfigManager from './ConfigManager.js';
import MessageProcessor from './MessageProcessor.js';
import CommandHandler from './CommandHandler.js';
import APIClient from './APIClient.js';

class BotCore {
    private config = ConfigManager.getInstance();
    private processor = new MessageProcessor();
    private handler = new CommandHandler();
    private api = new APIClient();
    public sock: any;

    async start() {
        const { state, saveCreds } = await useMultiFileAuthState(this.config.AUTH_FOLDER);
        const { version } = await fetchLatestBaileysVersion();

        console.log(`🚀 Iniciando Akira-Cyber v1.0 (WhatsApp v${version.join('.')})`);

        this.sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
            },
            printQRInTerminal: true,
            browser: Browsers.macOS('Akira-Cyber'),
            logger: pino({ level: 'silent' }),
            generateHighQualityLinkPreview: true
        });

        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', (update: any) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(`🔴 Conexão fechada. Reconectando: ${shouldReconnect}`);
                if (shouldReconnect) this.start();
            } else if (connection === 'open') {
                console.log('✅ AKIRA-CYBER CONECTADO!');
            }
        });

        this.sock.ev.on('messages.upsert', async ({ messages, type }: any) => {
            if (type !== 'notify') return;
            for (const m of messages) {
                if (!m.message || m.key.fromMe) continue;

                const text = this.processor.extractText(m);
                const sender = m.key.participant || m.key.remoteJid;
                const isGroup = m.key.remoteJid.endsWith('@g.us');

                // Passively listen for context (Akira Memory)
                this.api.listenMessage({
                    usuario: m.pushName || 'Isaac',
                    numero: sender,
                    mensagem: text,
                    isGroup: isGroup
                });

                const parsed = this.processor.parseCommand(text);

                if (parsed) {
                    await this.handler.handle(this.sock, m, parsed.command, parsed.args);
                } else if (!isGroup || text.toLowerCase().includes('akira')) {
                    // Se não for comando e for PV ou mencionou o nome, responde via AI
                    const aiRes = await this.api.processMessage({
                        usuario: m.pushName || 'Isaac',
                        numero: sender,
                        mensagem: text,
                        isGroup: isGroup
                    });
                    if (aiRes.success) {
                        await this.sock.sendMessage(m.key.remoteJid, { text: aiRes.resposta }, { quoted: m });
                    }
                }
            }
        });
    }
}

export default BotCore;

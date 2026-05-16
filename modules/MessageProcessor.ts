/**
 * ═══════════════════════════════════════════════════════════════════════
 * CLASSE: MessageProcessor (Ferramentas-cyber)
 * ═══════════════════════════════════════════════════════════════════════
 */

import { getContentType } from '@whiskeysockets/baileys';
import ConfigManager from './ConfigManager.js';

class MessageProcessor {
    private config = ConfigManager.getInstance();

    extractText(m: any): string {
        const type = getContentType(m.message);
        if (!type) return '';
        const msg = m.message;
        if (type === 'conversation') return msg.conversation;
        if (type === 'extendedTextMessage') return msg.extendedTextMessage.text;
        if (type === 'imageMessage') return msg.imageMessage.caption;
        return '';
    }

    parseCommand(text: string) {
        if (!text.startsWith(this.config.PREFIXO)) return null;
        const args = text.slice(this.config.PREFIXO.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();
        return { command, args, fullArgs: args.join(' ') };
    }
}

export default MessageProcessor;

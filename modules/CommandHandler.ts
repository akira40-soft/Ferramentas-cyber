/**
 * ═══════════════════════════════════════════════════════════════════════
 * CLASSE: CommandHandler (Ferramentas-cyber)
 * ═══════════════════════════════════════════════════════════════════════
 */

import ConfigManager from './ConfigManager.js';
import CyberToolkit from './CyberToolkit.js';
import OsintToolkit from './OsintToolkit.js';
import UsageManager from './UsageManager.js';

class CommandHandler {
    private config = ConfigManager.getInstance();
    private cyber = new CyberToolkit();
    private osint = new OsintToolkit();

    async handle(sock: any, m: any, command: string, args: string[]) {
        const jid = m.key.remoteJid;
        const sender = m.key.participant || jid;

        // Check Limit for non-owners
        const usage = UsageManager.getInstance();
        const limitCheck = usage.checkLimit(sender);

        if (!limitCheck.allowed && !this.config.isOwner(sender)) {
            const donateMsg = `❌ *LIMITE DE USO ATINGIDO* ❌\n\n` +
                `Você atingiu o limite gratuito de *2 usos por mês* para ferramentas avançadas.\n\n` +
                `Para liberar acesso ilimitado e apoiar o projeto, use o comando *#donate* no bot principal para se tornar VIP!\n\n` +
                `✨ *Benefícios Premium:*\n` +
                `• Uso ilimitado de Cyber & OSINT\n` +
                `• Badge especial de Apoiador\n` +
                `• Suporte prioritário`;
            return sock.sendMessage(jid, { text: donateMsg });
        }

        switch (command) {
            case 'menu':
                await this.showMainMenu(sock, jid);
                break;
            case 'cyber':
                await this.showCyberMenu(sock, jid);
                break;
            case 'osint':
                await this.showOsintMenu(sock, jid);
                break;

            // Cyber Tools
            case 'nmap':
                if (!args[0]) return sock.sendMessage(jid, { text: 'Uso: $nmap [alvo] (basic|full|vuln)' });
                usage.registerUsage(sender);
                await sock.sendMessage(jid, { text: `⏳ Executando scan [${args[1] || 'basic'}] em ${args[0]}...` });
                const nmapRes = await this.cyber.runNmap(args[0], args[1]);
                await sock.sendMessage(jid, { text: `✅ *NMAP RESULT*\n\n${nmapRes}` });
                break;

            case 'sqlmap':
                if (!args[0]) return sock.sendMessage(jid, { text: 'Uso: $sqlmap [url] [level:1-5]' });
                usage.registerUsage(sender);
                await sock.sendMessage(jid, { text: '⏳ Iniciando teste de SQL Injection...' });
                const sqlRes = await this.cyber.runSqlmap(args[0], parseInt(args[1] || '1'));
                await sock.sendMessage(jid, { text: `✅ *SQLMAP RESULT*\n\n${sqlRes}` });
                break;

            case 'set':
                if (!args[0]) return sock.sendMessage(jid, { text: 'Uso: $set [phishing|spear|sms]' });
                usage.registerUsage(sender);
                const setRes = await this.cyber.runSET(args[0]);
                await sock.sendMessage(jid, { text: `🎭 *SOCIAL ENGINEERING TEMPLATE*\n\n${setRes}` });
                break;

            // OSINT Tools
            case 'harvester':
                if (!args[0]) return sock.sendMessage(jid, { text: 'Uso: $harvester [dominio]' });
                usage.registerUsage(sender);
                await sock.sendMessage(jid, { text: '⏳ Colhendo informações (Emails/Subdomínios)...' });
                const harvesterRes = await this.osint.runTheHarvester(args[0]);
                await sock.sendMessage(jid, { text: `🔍 *THEHARVESTER RESULT*\n\n${harvesterRes}` });
                break;

            case 'dork':
                if (!args[0]) return sock.sendMessage(jid, { text: 'Uso: $dork [query]' });
                usage.registerUsage(sender);
                const dorkRes = await this.osint.runDorking(args.join(' '));
                await sock.sendMessage(jid, { text: dorkRes });
                break;

            case 'sherlock':
                if (!args[0]) return sock.sendMessage(jid, { text: 'Uso: $sherlock [username]' });
                usage.registerUsage(sender);
                await sock.sendMessage(jid, { text: '⏳ Buscando contas em redes sociais...' });
                const sherlockRes = await this.osint.runSherlock(args[0]);
                await sock.sendMessage(jid, { text: `🔍 *SHERLOCK RESULT*\n\n${sherlockRes}` });
                break;

            case 'holehe':
                if (!args[0]) return sock.sendMessage(jid, { text: 'Uso: $holehe [email]' });
                usage.registerUsage(sender);
                await sock.sendMessage(jid, { text: '⏳ Verificando serviços vinculados ao email...' });
                const holeheRes = await this.osint.runHolehe(args[0]);
                await sock.sendMessage(jid, { text: `🔍 *HOLEHE RESULT*\n\n${holeheRes}` });
                break;

            case 'geo':
                if (!args[0]) return sock.sendMessage(jid, { text: 'Uso: $geo [ip]' });
                usage.registerUsage(sender);
                const geoRes = await this.osint.lookupGeoIP(args[0]);
                await sock.sendMessage(jid, { text: geoRes });
                break;
        }
    }

    private async showCyberMenu(sock: any, jid: string) {
        const menu = `🛡️ *CYBERSECURITY TOOLS* 👑\n` +
            `────────────────────────────\n` +
            `• *$nmap [alvo] [tipo]* — Scans (basic|full|vuln)\n` +
            `• *$sqlmap [url] [lvl]* — SQL injection test\n` +
            `• *$nuclei [alvo]* — Vulnerability scanning\n` +
            `• *$set [tipo]* — Social Engineering templates\n` +
            `• *$whois [alvo]* — Informações de registro\n\n` +
            `_Digite $menu para voltar._`;
        await sock.sendMessage(jid, { text: menu });
    }

    private async showOsintMenu(sock: any, jid: string) {
        const menu = `🔍 *OSINT & INTELIGÊNCIA* 👑\n` +
            `────────────────────────────\n` +
            `• *$harvester [dominio]* — Recon de domínio/emails\n` +
            `• *$dork [query]* — Google Dorking\n` +
            `• *$sherlock [user]* — Busca em redes sociais\n` +
            `• *$holehe [email]* — Recon de e-mail\n` +
            `• *$shodan [ip]* — Busca no Shodan\n` +
            `• *$geo [ip]* — Geolocalização\n\n` +
            `_Digite $menu para voltar._`;
        await sock.sendMessage(jid, { text: menu });
    }
}

export default CommandHandler;

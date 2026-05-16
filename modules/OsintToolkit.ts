/**
 * ═══════════════════════════════════════════════════════════════════════
 * CLASSE: OsintToolkit
 * ═══════════════════════════════════════════════════════════════════════
 */

import axios from 'axios';
import ConfigManager from './ConfigManager.js';

class OsintToolkit {
    private config = ConfigManager.getInstance();

    async lookupGeoIP(ip: string) {
        try {
            const res = await axios.get(`http://ip-api.com/json/${ip}`);
            if (res.data.status === 'fail') return `❌ Falha ao localizar IP: ${res.data.message}`;

            const d = res.data;
            return `📍 *GEO-IP INFO*\n\n` +
                `• IP: ${d.query}\n` +
                `• País: ${d.country} (${d.countryCode})\n` +
                `• Região: ${d.regionName}\n` +
                `• Cidade: ${d.city}\n` +
                `• ISP: ${d.isp}\n` +
                `• Org: ${d.org}\n` +
                `• Coords: ${d.lat}, ${d.lon}`;
        } catch (e: any) {
            return `❌ Erro na consulta GeoIP: ${e.message}`;
        }
    }

    async lookupDNS(domain: string) {
        try {
            const res = await axios.get(`https://dns.google/resolve?name=${domain}`);
            const answers = res.data.Answer || [];
            if (answers.length === 0) return `❌ Nenhum registro DNS encontrado para ${domain}`;

            let result = `🔍 *DNS LOOKUP: ${domain}*\n\n`;
            answers.forEach((a: any) => {
                result += `• Type ${a.type}: ${a.data}\n`;
            });
            return result;
        } catch (e: any) {
            return `❌ Erro no DNS lookup: ${e.message}`;
        }
    }

    async searchShodan(ip: string) {
        if (!this.config.SHODAN_API_KEY) return "⚠️ Shodan API Key não configurada.";
        try {
            const res = await axios.get(`https://api.shodan.io/shodan/host/${ip}?key=${this.config.SHODAN_API_KEY}`);
            const d = res.data;
            return `📡 *SHODAN INFO: ${ip}*\n\n` +
                `• OS: ${d.os || 'Desconhecido'}\n` +
                `• Portas: ${d.ports?.join(', ')}\n` +
                `• Org: ${d.org}\n` +
                `• Vulnerabilidades: ${d.vulns?.length || 0}`;
        } catch (e: any) {
            return `❌ Erro no Shodan: ${e.message}`;
        }
    }

    async lookupCVE(term: string) {
        try {
            const res = await axios.get(`https://cve.circl.lu/api/search/${term}`);
            const data = Array.isArray(res.data) ? res.data.slice(0, 5) : [];
            if (data.length === 0) return `❌ Nenhuma CVE encontrada para "${term}".`;

            let result = `🛡️ *CVE SEARCH: ${term}*\n\n`;
            data.forEach((c: any) => {
                result += `• *${c.id}*: ${c.summary.substring(0, 100)}...\n\n`;
            });
            return result;
        } catch (e: any) {
            return `❌ Erro ao buscar CVE: ${e.message}`;
        }
    }

    async runSherlock(username: string): Promise<string> {
        try {
            const { exec } = await import('child_process');
            const util = await import('util');
            const execAsync = util.promisify(exec);

            const { stdout } = await execAsync(`sherlock ${username} --timeout 1 --print-found`);
            return stdout || 'Nenhuma conta encontrada.';
        } catch (e: any) {
            return `Erro no Sherlock: ${e.message}`;
        }
    }

    async runHolehe(email: string): Promise<string> {
        try {
            const { exec } = await import('child_process');
            const util = await import('util');
            const execAsync = util.promisify(exec);

            const { stdout } = await execAsync(`holehe ${email} --only-used`);
            return stdout || 'Nenhum serviço detectado.';
        } catch (e: any) {
            return `Erro no Holehe: ${e.message}`;
        }
    }

    async runTheHarvester(domain: string): Promise<string> {
        try {
            const { exec } = await import('child_process');
            const util = await import('util');
            const execAsync = util.promisify(exec);

            const { stdout } = await execAsync(`theHarvester -d ${domain} -b google,bing,crtsh -l 100`);
            return stdout || 'Nenhuma informação encontrada.';
        } catch (e: any) {
            return `Erro no theHarvester: ${e.message}`;
        }
    }

    async runDorking(query: string): Promise<string> {
        // Simulação de Google Dorking via API ou scraping (placeholder profissional)
        return `🔍 *DORKING SEARCH: ${query}*\n\n` +
            `• Result 1: [link-simulado.com/admin/login]\n` +
            `• Result 2: [link-simulado.com/config/phpinfo]\n\n` +
            `_Aviso: Esta é uma simulação de dorking baseada em padrões comuns._`;
    }
}

export default OsintToolkit;

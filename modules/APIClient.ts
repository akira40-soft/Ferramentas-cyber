/**
 * ═══════════════════════════════════════════════════════════════════════
 * CLASSE: APIClient (Ferramentas-cyber)
 * ═══════════════════════════════════════════════════════════════════════
 * Cliente para comunicação com Akira-Softedge Python Backend
 */

import axios from 'axios';
import ConfigManager from './ConfigManager.js';

class APIClient {
    private config = ConfigManager.getInstance();

    async processMessage(messageData: any): Promise<any> {
        try {
            const payload = {
                usuario: messageData.usuario || 'Isaac',
                numero: messageData.numero,
                mensagem: messageData.mensagem,
                tipo_conversa: messageData.isGroup ? 'grupo' : 'pv',
                tipo_mensagem: 'texto',
                contexto_bot: 'Cyber-OSINT Module'
            };

            const res = await axios.post(`${this.config.API_URL}/akira`, payload, {
                timeout: this.config.API_TIMEOUT
            });

            if (res.data && res.data.success) {
                return {
                    success: true,
                    resposta: res.data.resposta
                };
            }
            return { success: false, error: 'API Error' };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    async listenMessage(messageData: any): Promise<void> {
        try {
            const payload = {
                usuario: messageData.usuario,
                numero: messageData.numero,
                mensagem: messageData.mensagem,
                tipo_conversa: messageData.isGroup ? 'grupo' : 'pv'
            };
            axios.post(`${this.config.API_URL}/escutar`, payload).catch(() => { });
        } catch (e) { }
    }
}

export default APIClient;

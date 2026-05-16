/**
 * ═══════════════════════════════════════════════════════════════════════
 * CLASSE: ConfigManager (Ferramentas-cyber)
 * ═══════════════════════════════════════════════════════════════════════
 */

import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import fs from 'fs';

try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const envPath = path.resolve(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const { config: loadEnv } = createRequire(import.meta.url)('dotenv');
        loadEnv({ path: envPath, override: false });
    }
} catch (_e) { }

class ConfigManager {
    static instance: ConfigManager | null = null;

    public PORT: number;
    public BOT_NAME: string;
    public PREFIXO: string;
    public BOT_NUMERO_REAL: string;
    public DONO_USERS: Array<{ numero: string, nomeExato: string }>;
    public AUTH_FOLDER: string;
    public DATABASE_FOLDER: string;
    public LOGS_FOLDER: string;
    public TEMP_FOLDER: string;
    public SHODAN_API_KEY: string;
    public API_URL: string;
    public API_TIMEOUT: number;
    public API_RETRY_ATTEMPTS: number;
    public API_RETRY_DELAY: number;

    constructor() {
        if (ConfigManager.instance) return ConfigManager.instance;

        this.PORT = Number(process.env.PORT || 3000);
        this.BOT_NAME = process.env.BOT_NAME || 'Akira-Cyber';
        this.PREFIXO = process.env.PREFIXO || '$';
        this.BOT_NUMERO_REAL = process.env.BOT_NUMERO || '37839265886398';

        // Sincronizado com index-main
        this.DONO_USERS = [
            { numero: '37839265886398', nomeExato: 'Bot Admin' },
            { numero: '244952786417', nomeExato: 'Isaac Quarenta' },
            { numero: '244937035662', nomeExato: 'Isaac Quarenta' },
            { numero: '244978787009', nomeExato: 'Isaac Quarenta' },
            { numero: '202391978787009', nomeExato: 'Isaac Quarenta' },
            { numero: '24491978787009', nomeExato: 'Isaac Quarenta' },
            { numero: '24478787009', nomeExato: 'Isaac Quarenta' }
        ];

        const baseDataPath = process.env.RAILWAY_ENVIRONMENT ? '/app/data' : '.';
        this.AUTH_FOLDER = path.join(baseDataPath, 'auth_info_baileys');
        this.DATABASE_FOLDER = path.join(baseDataPath, 'database');
        this.LOGS_FOLDER = path.join(baseDataPath, 'logs');
        this.TEMP_FOLDER = path.join(baseDataPath, 'temp');

        this.SHODAN_API_KEY = process.env.SHODAN_API_KEY || '';
        this.API_URL = process.env.API_URL || 'https://akra35567-akira-softedge.hf.space/api';
        this.API_TIMEOUT = 300000;
        this.API_RETRY_ATTEMPTS = 3;
        this.API_RETRY_DELAY = 1000;

        ConfigManager.instance = this;
    }

    static getInstance() {
        if (!ConfigManager.instance) new ConfigManager();
        return ConfigManager.instance!;
    }

    isOwner(numero: string): boolean {
        const normalized = String(numero).split('@')[0].split(':')[0].replace('lid_', '');
        return this.DONO_USERS.some(u => {
            const uId = String(u.numero).split('@')[0].split(':')[0].replace('lid_', '');
            return uId === normalized;
        });
    }
}

export default ConfigManager;

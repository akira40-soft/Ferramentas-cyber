/**
 * ═══════════════════════════════════════════════════════════════════════
 * CLASSE: UsageManager (Ferramentas-cyber)
 * ═══════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import ConfigManager from './ConfigManager.js';

interface UsageData {
    [jid: string]: {
        count: number;
        month: string; // YYYY-MM
    }
}

class UsageManager {
    private static instance: UsageManager;
    private config = ConfigManager.getInstance();
    private filePath: string;
    private data: UsageData = {};

    private constructor() {
        this.filePath = path.join(this.config.DATABASE_FOLDER, 'usage.json');
        this.load();
    }

    public static getInstance(): UsageManager {
        if (!UsageManager.instance) {
            UsageManager.instance = new UsageManager();
        }
        return UsageManager.instance;
    }

    private load() {
        try {
            if (fs.existsSync(this.filePath)) {
                this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
            }
        } catch (e) {
            console.error('Erro ao carregar usage.json:', e);
            this.data = {};
        }
    }

    private save() {
        try {
            if (!fs.existsSync(path.dirname(this.filePath))) {
                fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
            }
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
        } catch (e) {
            console.error('Erro ao salvar usage.json:', e);
        }
    }

    public checkLimit(jid: string): { allowed: boolean, remaining: number } {
        // Owners are always allowed
        if (this.config.isOwner(jid)) {
            return { allowed: true, remaining: Infinity };
        }

        const currentMonth = new Date().toISOString().slice(0, 7);
        const userUsage = this.data[jid];

        if (!userUsage || userUsage.month !== currentMonth) {
            return { allowed: true, remaining: 2 };
        }

        return {
            allowed: userUsage.count < 2,
            remaining: Math.max(0, 2 - userUsage.count)
        };
    }

    public registerUsage(jid: string) {
        if (this.config.isOwner(jid)) return;

        const currentMonth = new Date().toISOString().slice(0, 7);
        if (!this.data[jid] || this.data[jid].month !== currentMonth) {
            this.data[jid] = { count: 1, month: currentMonth };
        } else {
            this.data[jid].count++;
        }
        this.save();
    }
}

export default UsageManager;

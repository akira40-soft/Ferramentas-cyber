/**
 * ═══════════════════════════════════════════════════════════════════════
 * ENTRY POINT: Ferramentas-cyber
 * ═══════════════════════════════════════════════════════════════════════
 */

import BotCore from './modules/BotCore.js';

const bot = new BotCore();
bot.start().catch(err => {
    console.error('❌ Erro crítico no startup:', err);
    process.exit(1);
});

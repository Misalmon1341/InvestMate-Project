/**
 * Servicio de Misiones y Logros con Supabase
 * Maneja el sistema de gamificación
 */

import { supabase, isConnected } from './supabase-client.js';

// Datos base de misiones
const MISSIONS_DATA = [
    { id: 1, title: 'Analista Principiante', description: 'Lee al menos 1 artículo y realiza tu primera inversión.', reward: 1000, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-star.svg', type: 'first_purchase_after_learning' },
    { id: 2, title: 'Diversificación Estratégica', description: 'Ten al menos 5 activos diferentes en tu portafolio.', reward: 2500, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-share.svg', type: 'diversify_5' },
    { id: 3, title: 'Fondo de Seguridad', description: 'Invierte al menos $5,000 en un ETF seguro.', reward: 3000, icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-barcode.svg', type: 'etf_5k' },
    { id: 4, title: 'Portafolio Crypto', description: 'Invierte en 3 criptomonedas diferentes.', reward: 2000, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-bitcoin.svg', type: 'crypto_3' },
    { id: 5, title: 'Magnate en Ascenso', description: 'Alcanza un valor total de portafolio de $50,000.', reward: 5000, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-dollar-circle.svg', type: 'portfolio_50k' },
    { id: 6, title: 'Académico Financiero', description: 'Lee al menos 10 artículos de aprendizaje.', reward: 1500, icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-address-book.svg', type: 'read_10_articles' },
    { id: 7, title: 'Trader Experimentado', description: 'Realiza al menos 15 operaciones de compra.', reward: 4000, icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-cart-check.svg', type: 'active_trader_15' },
    { id: 8, title: 'Maestro Invesmate', description: 'Completa todas las demás misiones.', reward: 10000, icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-treasure-chest.svg', type: 'all_missions' }
];

// Datos base de logros
const ACHIEVEMENTS_DATA = [
    { id: 1, name: 'Primeros Pasos', description: 'Completa tu registro', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-star.svg' },
    { id: 2, name: 'Inversor Informado', description: 'Primera compra tras estudiar', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-dollar-circle.svg' },
    { id: 3, name: 'Gran Diversificador', description: '10 activos diferentes', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-share.svg' },
    { id: 4, name: 'Rey del ETF', description: '$10,000 en ETFs', icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-hourglass.svg' },
    { id: 5, name: 'Trader Frenético', description: '30 operaciones realizadas', icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-cart-check.svg' },
    { id: 6, name: 'Erudito', description: 'Lee los 24 artículos de aprendizaje', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-intellect.svg' },
    { id: 7, name: 'Lobo de Wall Street', description: 'Portafolio de $250K', icon: './img/boxicons-SVG2/svgs/basic/regular/400/bx-dollar-circle-stars.svg' },
    { id: 8, name: 'Leyenda', description: 'Todas las misiones completadas', icon: './img/boxicons-SVG1/svgs/basic/regular/400/bx-gem-alt.svg' }
];

export const missionsService = {
    /**
     * Obtener misiones del usuario
     */
    async getUserMissions(userId) {
        if (!isConnected) {
            return JSON.parse(localStorage.getItem('invesmate_missions') || '[]');
        }

        try {
            // Obtener misiones del usuario
            const { data: userMissions } = await supabase
                .from('user_missions')
                .select('*')
                .eq('user_id', userId);

            // Si no tiene misiones, inicializar con las predeterminadas
            if (!userMissions || userMissions.length === 0) {
                await this.initializeMissions(userId);
                // En lugar de recursión, devolvemos misiones vacías/base para evitar bucles infinitos
                return MISSIONS_DATA.map(m => ({
                    ...m,
                    completed: false,
                    completedAt: null
                }));
            }

            // Combinar con datos base para tener iconos y tipos
            return userMissions.map(um => {
                const base = MISSIONS_DATA.find(m => m.id === um.mission_id);
                return {
                    id: um.mission_id,
                    title: um.title,
                    description: um.description,
                    reward: um.reward,
                    icon: base?.icon || '🎯',
                    type: base?.type || 'unknown',
                    completed: um.completed,
                    completedAt: um.completed_at
                };
            });
        } catch (error) {
            console.error('Error obteniendo misiones:', error);
            return [];
        }
    },

    /**
     * Obtener logros del usuario
     */
    async getUserAchievements(userId) {
        if (!isConnected) {
            return JSON.parse(localStorage.getItem('invesmate_achievements') || '[]');
        }

        try {
            const { data: userAchievements } = await supabase
                .from('user_achievements')
                .select('*')
                .eq('user_id', userId);

            if (!userAchievements || userAchievements.length === 0) {
                await this.initializeAchievements(userId);
                // Evitar recursión infinita
                return ACHIEVEMENTS_DATA.map(a => ({
                    ...a,
                    unlocked: false,
                    unlockedAt: null
                }));
            }

            return userAchievements.map(ua => {
                const base = ACHIEVEMENTS_DATA.find(a => a.id === ua.achievement_id);
                return {
                    id: ua.achievement_id,
                    name: ua.name,
                    description: ua.description,
                    icon: base?.icon || '🏆',
                    unlocked: ua.unlocked,
                    unlockedAt: ua.unlocked_at
                };
            });
        } catch (error) {
            console.error('Error obteniendo logros:', error);
            return [];
        }
    },

    /**
     * Inicializar misiones para un usuario nuevo
     */
    async initializeMissions(userId) {
        if (!isConnected) {
            localStorage.setItem('invesmate_missions', JSON.stringify(MISSIONS_DATA));
            return;
        }

        try {
            const missionsToInsert = MISSIONS_DATA.map(m => ({
                user_id: userId,
                mission_id: m.id,
                title: m.title,
                description: m.description,
                reward: m.reward
            }));

            await supabase.from('user_missions').insert(missionsToInsert);
        } catch (error) {
            console.error('Error inicializando misiones:', error);
        }
    },

    /**
     * Inicializar logros para un usuario nuevo
     */
    async initializeAchievements(userId) {
        if (!isConnected) {
            localStorage.setItem('invesmate_achievements', JSON.stringify(ACHIEVEMENTS_DATA));
            return;
        }

        try {
            const achievementsToInsert = ACHIEVEMENTS_DATA.map(a => ({
                user_id: userId,
                achievement_id: a.id,
                name: a.name,
                description: a.description
            }));

            await supabase.from('user_achievements').insert(achievementsToInsert);
        } catch (error) {
            console.error('Error inicializando logros:', error);
        }
    },

    /**
     * Completar una misión
     */
    async completeMission(userId, missionId) {
        if (!isConnected) {
            return this._completeMissionLocal(missionId);
        }

        try {
            // Verificar si ya está completada
            const { data: mission } = await supabase
                .from('user_missions')
                .select('completed, reward')
                .eq('user_id', userId)
                .eq('mission_id', missionId)
                .single();

            if (!mission || mission.completed) {
                return { success: false, alreadyCompleted: true };
            }

            // Marcar como completada
            await supabase
                .from('user_missions')
                .update({
                    completed: true,
                    completed_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('mission_id', missionId);

            // Actualizar balance del usuario
            await supabase.rpc('increment_balance', {
                user_id: userId,
                amount: mission.reward
            });

            // Actualizar contador de misiones completadas
            const { data: profile } = await supabase
                .from('profiles')
                .select('missions_completed')
                .eq('id', userId)
                .single();

            if (profile) {
                await supabase
                    .from('profiles')
                    .update({ missions_completed: (profile.missions_completed || 0) + 1 })
                    .eq('id', userId);
            }

            return { success: true, reward: mission.reward };
        } catch (error) {
            console.error('Error completando misión:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Desbloquear logro
     */
    async unlockAchievement(userId, achievementId) {
        if (!isConnected) {
            return this._unlockAchievementLocal(achievementId);
        }

        try {
            // Verificar si ya está desbloqueado
            const { data: achievement } = await supabase
                .from('user_achievements')
                .select('unlocked, name')
                .eq('user_id', userId)
                .eq('achievement_id', achievementId)
                .single();

            if (!achievement || achievement.unlocked) {
                return { success: false, alreadyUnlocked: true };
            }

            // Desbloquear logro
            await supabase
                .from('user_achievements')
                .update({
                    unlocked: true,
                    unlocked_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('achievement_id', achievementId);

            // Actualizar contador
            const { data: profile } = await supabase
                .from('profiles')
                .select('achievements_unlocked')
                .eq('id', userId)
                .single();

            if (profile) {
                await supabase
                    .from('profiles')
                    .update({ achievements_unlocked: (profile.achievements_unlocked || 0) + 1 })
                    .eq('id', userId);
            }

            return { success: true, name: achievement.name };
        } catch (error) {
            console.error('Error desbloqueando logro:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Verificar y completar misiones automáticamente
     */
    async checkAndCompleteMissions(userId, stats) {
        const missions = await this.getUserMissions(userId);
        const completed = [];

        for (const mission of missions) {
            if (mission.completed) continue;

            let shouldComplete = false;

            switch (mission.type) {
                case 'first_purchase_after_learning':
                    shouldComplete = stats.articlesRead >= 1 && stats.totalPurchases >= 1;
                    break;
                case 'diversify_5':
                    shouldComplete = stats.uniqueAssets >= 5;
                    break;
                case 'etf_5k':
                    shouldComplete = stats.etfValue >= 5000;
                    break;
                case 'crypto_3':
                    shouldComplete = stats.cryptoCount >= 3;
                    break;
                case 'portfolio_50k':
                    shouldComplete = stats.portfolioValue >= 50000;
                    break;
                case 'read_10_articles':
                    shouldComplete = stats.articlesRead >= 10;
                    break;
                case 'active_trader_15':
                    shouldComplete = stats.totalPurchases >= 15;
                    break;
                case 'all_missions':
                    const othersComplete = missions.filter(m => m.completed && m.type !== 'all_missions').length;
                    shouldComplete = othersComplete >= MISSIONS_DATA.length - 1;
                    break;
            }

            if (shouldComplete) {
                const result = await this.completeMission(userId, mission.id);
                if (result.success) {
                    completed.push({ missionId: mission.id, reward: result.reward });
                }
            }
        }

        return completed;
    },

    // ========================================
    // MÉTODOS LOCALES (FALLBACK)
    // ========================================
    _completeMissionLocal(missionId) {
        const missions = JSON.parse(localStorage.getItem('invesmate_missions') || '[]');
        const mission = missions.find(m => m.id === missionId);

        if (!mission || mission.completed) {
            return { success: false, alreadyCompleted: true };
        }

        mission.completed = true;
        localStorage.setItem('invesmate_missions', JSON.stringify(missions));

        // Actualizar balance
        const balance = parseFloat(localStorage.getItem('invesmate_balance') || '10000');
        localStorage.setItem('invesmate_balance', JSON.stringify(balance + mission.reward));

        return { success: true, reward: mission.reward };
    },

    _unlockAchievementLocal(achievementId) {
        const achievements = JSON.parse(localStorage.getItem('invesmate_achievements') || '[]');
        const achievement = achievements.find(a => a.id === achievementId);

        if (!achievement || achievement.unlocked) {
            return { success: false, alreadyUnlocked: true };
        }

        achievement.unlocked = true;
        localStorage.setItem('invesmate_achievements', JSON.stringify(achievements));

        return { success: true, name: achievement.name };
    }
};

/**
 * Obtener datos base de misiones (para UI)
 */
export function getMissionsData() {
    return MISSIONS_DATA;
}

/**
 * Obtener datos base de logros (para UI)
 */
export function getAchievementsData() {
    return ACHIEVEMENTS_DATA;
}

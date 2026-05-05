/**
 * Servicio de Misiones y Logros con Supabase
 * Maneja el sistema de gamificación
 */

import { supabase, isConnected } from './supabase-client.js';

// Datos base de misiones
const MISSIONS_DATA = [
    { id: 1, title: 'Primera Inversión', description: 'Realiza tu primera compra de acciones', reward: 500, icon: '✨', type: 'first_purchase' },
    { id: 2, title: 'Diversificador', description: 'Compra 3 activos diferentes', reward: 1000, icon: '📈', type: 'diversify' },
    { id: 3, title: 'Inversor ETF', description: 'Compra tu primer ETF', reward: 750, icon: '💵', type: 'first_etf' },
    { id: 4, title: 'Cripto Entusiasta', description: 'Invierte en criptomonedas', reward: 1000, icon: '🪙', type: 'first_crypto' },
    { id: 5, title: 'Portafolio de $1K', description: 'Ten $1,000 en tu portafolio', reward: 1500, icon: '💲', type: 'portfolio_1k' },
    { id: 6, title: 'Estudiante Dedicado', description: 'Lee 3 artículos de aprendizaje', reward: 500, icon: '📖', type: 'read_articles' },
    { id: 7, title: 'Inversor Activo', description: 'Realiza 5 compras diferentes', reward: 2000, icon: '⚡', type: 'active_trader' },
    { id: 8, title: 'Maestro de Invesmate', description: 'Completa todas las misiones', reward: 5000, icon: '👑', type: 'all_missions' }
];

// Datos base de logros
const ACHIEVEMENTS_DATA = [
    { id: 1, name: 'Primeros Pasos', description: 'Completa tu registro', icon: '🌟' },
    { id: 2, name: 'Inversor Novato', description: 'Primera compra realizada', icon: '💲' },
    { id: 3, name: 'Diversificador', description: '5 activos diferentes', icon: '🔀' },
    { id: 4, name: 'Hodler', description: 'Mantén inversiones por 7 días', icon: '⏳' },
    { id: 5, name: 'Trader Activo', description: '20 operaciones realizadas', icon: '⚡' },
    { id: 6, name: 'Estudiante', description: 'Completa el aprendizaje', icon: '🎓' },
    { id: 7, name: 'Millonario Virtual', description: 'Portafolio de $100K', icon: '💵' },
    { id: 8, name: 'Maestro', description: 'Todas las misiones completadas', icon: '🏅' }
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
                return this.getUserMissions(userId);
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
                return this.getUserAchievements(userId);
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
            await supabase
                .from('profiles')
                .update({ missions_completed: supabase.raw('missions_completed + 1') })
                .eq('id', userId);

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
            await supabase
                .from('profiles')
                .update({ achievements_unlocked: supabase.raw('achievements_unlocked + 1') })
                .eq('id', userId);

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
                case 'first_purchase':
                    shouldComplete = stats.totalPurchases >= 1;
                    break;
                case 'diversify':
                    shouldComplete = stats.uniqueAssets >= 3;
                    break;
                case 'first_etf':
                    shouldComplete = stats.hasETF;
                    break;
                case 'first_crypto':
                    shouldComplete = stats.hasCrypto;
                    break;
                case 'portfolio_1k':
                    shouldComplete = stats.portfolioValue >= 1000;
                    break;
                case 'active_trader':
                    shouldComplete = stats.totalPurchases >= 5;
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

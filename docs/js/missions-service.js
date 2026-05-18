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
    async getUserMissions(userId) {
        const localKey = userId ? `invesmate_missions_${userId}` : 'invesmate_missions';
        
        if (!isConnected) {
            let localMissions = JSON.parse(localStorage.getItem(localKey) || localStorage.getItem('invesmate_missions') || 'null');
            if (!localMissions || localMissions.length === 0) {
                localMissions = MISSIONS_DATA.map(m => ({ ...m, completed: false, completedAt: null }));
                localStorage.setItem(localKey, JSON.stringify(localMissions));
            }
            return localMissions;
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
                
                let localMissions = JSON.parse(localStorage.getItem(localKey) || 'null');
                if (!localMissions || localMissions.length === 0) {
                    localMissions = MISSIONS_DATA.map(m => ({ ...m, completed: false, completedAt: null }));
                }
                localStorage.setItem(localKey, JSON.stringify(localMissions));
                
                return localMissions;
            }

            // Combinar con datos base y local para evitar que se pierdan las misiones locales completadas
            let localMissions = JSON.parse(localStorage.getItem(localKey) || '[]');
            const mergedMissions = userMissions.map(um => {
                const base = MISSIONS_DATA.find(m => m.id === um.mission_id) || {};
                const local = localMissions.find(m => m.id === um.mission_id) || {};
                
                return {
                    id: um.mission_id,
                    title: um.title || base.title || `Misión #${um.mission_id}`,
                    description: um.description || base.description || 'Completa esta misión para ganar.',
                    reward: um.reward || base.reward || 1000,
                    icon: base.icon || '🎯',
                    type: base.type || 'unknown',
                    completed: um.completed || local.completed || false,
                    completedAt: um.completed_at || local.completedAt || null
                };
            });

            // Guardar espejo local para fallback resiliente
            localStorage.setItem(localKey, JSON.stringify(mergedMissions));

            return mergedMissions;
        } catch (error) {
            console.error('Error obteniendo misiones, recurriendo a local:', error);
            let localMissions = JSON.parse(localStorage.getItem(localKey) || localStorage.getItem('invesmate_missions') || 'null');
            if (!localMissions || localMissions.length === 0) {
                localMissions = MISSIONS_DATA.map(m => ({ ...m, completed: false, completedAt: null }));
                localStorage.setItem(localKey, JSON.stringify(localMissions));
            }
            return localMissions;
        }
    },

    /**
     * Obtener logros del usuario
     */
    async getUserAchievements(userId) {
        const localKey = userId ? `invesmate_achievements_${userId}` : 'invesmate_achievements';
        
        if (!isConnected) {
            let localAchievements = JSON.parse(localStorage.getItem(localKey) || localStorage.getItem('invesmate_achievements') || 'null');
            if (!localAchievements || localAchievements.length === 0) {
                localAchievements = ACHIEVEMENTS_DATA.map(a => ({ ...a, unlocked: false, unlockedAt: null }));
                localStorage.setItem(localKey, JSON.stringify(localAchievements));
            }
            return localAchievements;
        }

        try {
            const { data: userAchievements } = await supabase
                .from('user_achievements')
                .select('*')
                .eq('user_id', userId);

            if (!userAchievements || userAchievements.length === 0) {
                await this.initializeAchievements(userId);
                
                let localAchievements = JSON.parse(localStorage.getItem(localKey) || 'null');
                if (!localAchievements || localAchievements.length === 0) {
                    localAchievements = ACHIEVEMENTS_DATA.map(a => ({ ...a, unlocked: false, unlockedAt: null }));
                }
                localStorage.setItem(localKey, JSON.stringify(localAchievements));
                
                return localAchievements;
            }

            let localAchievements = JSON.parse(localStorage.getItem(localKey) || '[]');
            const mergedAchievements = userAchievements.map(ua => {
                const base = ACHIEVEMENTS_DATA.find(a => a.id === ua.achievement_id) || {};
                const local = localAchievements.find(a => a.id === ua.achievement_id) || {};
                
                return {
                    id: ua.achievement_id,
                    name: ua.name || base.name || `Logro #${ua.achievement_id}`,
                    description: ua.description || base.description || 'Logro desbloqueado.',
                    icon: base.icon || '🏆',
                    unlocked: ua.unlocked || local.unlocked || false,
                    unlockedAt: ua.unlocked_at || local.unlockedAt || null
                };
            });

            // Guardar espejo local
            localStorage.setItem(localKey, JSON.stringify(mergedAchievements));

            return mergedAchievements;
        } catch (error) {
            console.error('Error obteniendo logros, recurriendo a local:', error);
            let localAchievements = JSON.parse(localStorage.getItem(localKey) || localStorage.getItem('invesmate_achievements') || 'null');
            if (!localAchievements || localAchievements.length === 0) {
                localAchievements = ACHIEVEMENTS_DATA.map(a => ({ ...a, unlocked: false, unlockedAt: null }));
                localStorage.setItem(localKey, JSON.stringify(localAchievements));
            }
            return localAchievements;
        }
    },

    /**
     * Inicializar misiones para un usuario nuevo
     */
    async initializeMissions(userId) {
        const localKey = userId ? `invesmate_missions_${userId}` : 'invesmate_missions';
        
        // Guardar siempre en local primero para asegurar disponibilidad
        const baseMissions = MISSIONS_DATA.map(m => ({
            ...m,
            completed: false,
            completedAt: null
        }));
        localStorage.setItem(localKey, JSON.stringify(baseMissions));

        if (!isConnected) return;

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
        const localKey = userId ? `invesmate_achievements_${userId}` : 'invesmate_achievements';
        
        // Guardar siempre en local primero
        const baseAchievements = ACHIEVEMENTS_DATA.map(a => ({
            ...a,
            unlocked: false,
            unlockedAt: null
        }));
        localStorage.setItem(localKey, JSON.stringify(baseAchievements));

        if (!isConnected) return;

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
        const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (!isConnected || !isUUID(userId)) {
            return this._completeMissionLocal(userId, missionId);
        }

        try {
            // Obtener recompensa desde los datos base para asegurar consistencia
            const baseMission = MISSIONS_DATA.find(m => m.id === missionId);
            const rewardAmount = baseMission ? baseMission.reward : 1000;

            // Verificar si ya está completada (sólo seleccionamos 'completed' para evitar errores de columnas de base de datos)
            const { data: mission, error: selectError } = await supabase
                .from('user_missions')
                .select('completed')
                .eq('user_id', userId)
                .eq('mission_id', missionId)
                .maybeSingle();

            if (selectError) throw selectError;

            if (mission && mission.completed) {
                return { success: false, alreadyCompleted: true };
            }
            // Marcar como completada usando upsert para asegurar que se cree si no existe
            const { error: updateError } = await supabase
                .from('user_missions')
                .upsert({
                    user_id: userId,
                    mission_id: missionId,
                    title: baseMission ? baseMission.title : `Misión #${missionId}`,
                    description: baseMission ? baseMission.description : '',
                    reward: rewardAmount,
                    completed: true,
                    completed_at: new Date().toISOString()
                }, { onConflict: 'user_id, mission_id' });

            if (updateError) throw updateError;

            // Actualizar balance del usuario en Supabase
            try {
                const { error: rpcError } = await supabase.rpc('increment_balance', {
                    user_id: userId,
                    amount: rewardAmount
                });

                if (rpcError) {
                    // Fallback si RPC no existe: Actualizar directamente en la tabla profiles
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('balance')
                        .eq('id', userId)
                        .single();

                    if (profile) {
                        const newBalance = parseFloat(profile.balance || 0) + rewardAmount;
                        await supabase
                            .from('profiles')
                            .update({ balance: newBalance })
                            .eq('id', userId);
                    }
                }
            } catch (rpcErr) {
                console.warn('RPC increment_balance falló, intentando actualización directa:', rpcErr);
            }

            // Actualizar contador de misiones completadas en profiles
            try {
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
            } catch (profileErr) {
                console.warn('Error actualizando profile missions count:', profileErr);
            }

            // Sincronizar localmente también para consistencia
            this._completeMissionLocal(userId, missionId);

            return { success: true, reward: rewardAmount };
        } catch (error) {
            console.error('Error completando misión en Supabase, recurriendo a local:', error);
            return this._completeMissionLocal(userId, missionId);
        }
    },

    /**
     * Desbloquear logro
     */
    async unlockAchievement(userId, achievementId) {
        const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (!isConnected || !isUUID(userId)) {
            return this._unlockAchievementLocal(userId, achievementId);
        }

        try {
            const baseAchievement = ACHIEVEMENTS_DATA.find(a => a.id === achievementId);
            const achievementName = baseAchievement ? baseAchievement.name : `Logro #${achievementId}`;

            // Verificar si ya está desbloqueado (seleccionando sólo unlocked)
            const { data: achievement, error: selectError } = await supabase
                .from('user_achievements')
                .select('unlocked')
                .eq('user_id', userId)
                .eq('achievement_id', achievementId)
                .maybeSingle();

            if (selectError) throw selectError;

            if (achievement && achievement.unlocked) {
                return { success: false, alreadyUnlocked: true };
            }

            // Desbloquear logro
            const { error: updateError } = await supabase
                .from('user_achievements')
                .update({
                    unlocked: true,
                    unlocked_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('achievement_id', achievementId);

            if (updateError) throw updateError;

            // Actualizar contador en profiles
            try {
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
            } catch (profileErr) {
                console.warn('Error actualizando profile achievements count:', profileErr);
            }

            // Sincronizar localmente también
            this._unlockAchievementLocal(userId, achievementId);

            return { success: true, name: achievementName };
        } catch (error) {
            console.error('Error desbloqueando logro en Supabase, recurriendo a local:', error);
            return this._unlockAchievementLocal(userId, achievementId);
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
    _completeMissionLocal(userId, missionId) {
        const missionsKey = userId ? `invesmate_missions_${userId}` : 'invesmate_missions';
        const missions = JSON.parse(localStorage.getItem(missionsKey) || localStorage.getItem('invesmate_missions') || '[]');
        const mission = missions.find(m => m.id === missionId);

        if (!mission || mission.completed) {
            return { success: false, alreadyCompleted: true };
        }

        mission.completed = true;
        localStorage.setItem(missionsKey, JSON.stringify(missions));

        // Actualizar balance con clave específica de usuario
        const balanceKey = userId ? `invesmate_balance_${userId}` : 'invesmate_balance';
        const balance = parseFloat(localStorage.getItem(balanceKey) || localStorage.getItem('invesmate_balance') || '10000');
        localStorage.setItem(balanceKey, JSON.stringify(balance + mission.reward));

        return { success: true, reward: mission.reward };
    },

    _unlockAchievementLocal(userId, achievementId) {
        const achievementsKey = userId ? `invesmate_achievements_${userId}` : 'invesmate_achievements';
        const achievements = JSON.parse(localStorage.getItem(achievementsKey) || localStorage.getItem('invesmate_achievements') || '[]');
        const achievement = achievements.find(a => a.id === achievementId);

        if (!achievement || achievement.unlocked) {
            return { success: false, alreadyUnlocked: true };
        }

        achievement.unlocked = true;
        localStorage.setItem(achievementsKey, JSON.stringify(achievements));

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

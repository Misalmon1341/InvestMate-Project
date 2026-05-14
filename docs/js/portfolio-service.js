/**
 * Servicio de Portfolio con Supabase
 * Maneja compras, ventas y seguimiento de activos
 */

import { supabase, isConnected } from './supabase-client.js';

export const portfolioService = {
    /**
     * Obtener portfolio de un usuario
     */
    async getPortfolio(userId) {
        if (!isConnected) {
            return JSON.parse(localStorage.getItem('invesmate_portfolio') || '[]');
        }

        try {
            const { data, error } = await supabase
                .from('portfolio')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo portfolio:', error);
            return [];
        }
    },

    /**
     * Comprar activo
     */
    async buyAsset(userId, product, amount) {
        const shares = amount / product.price;

        // Validar si es un UUID (Supabase) o un ID local
        const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        if (!isConnected || !isUUID(userId)) {
            console.warn('Usando almacenamiento local para compra (ID no es UUID o no hay conexión)');
            return this._buyLocal(userId, product, amount, shares);
        }

        try {
            // Asegurarnos de que el usuario está realmente autenticado en Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('Sesión de Supabase no encontrada');
            }
            
            // Usar el ID de la sesión activa para evitar discrepancias
            const activeUserId = user.id;

            // Verificar si ya tiene este activo
            const { data: existing } = await supabase
                .from('portfolio')
                .select('*')
                .eq('user_id', activeUserId)
                .eq('product_id', product.id)
                .single();

            if (existing) {
                // Actualizar posición existente
                const newShares = existing.shares + shares;
                const newAvgPrice = ((existing.shares * existing.avg_price) + amount) / newShares;
                const newValue = existing.invested_value + amount;

                const { error } = await supabase
                    .from('portfolio')
                    .update({
                        shares: newShares,
                        avg_price: newAvgPrice,
                        invested_value: newValue,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id);

                if (error) throw error;
            } else {
                // Crear nueva posición
                const { error } = await supabase
                    .from('portfolio')
                    .insert({
                        user_id: activeUserId,
                        product_id: product.id,
                        product_name: product.name,
                        product_symbol: product.symbol,
                        product_category: product.category,
                        shares: shares,
                        avg_price: product.price,
                        invested_value: amount
                    });

                if (error) throw error;
            }

            // Registrar transacción
            await this._recordTransaction(activeUserId, product, 'buy', shares, product.price, amount);

            return { success: true, shares };
        } catch (error) {
            console.error('Error en compra:', error);
            // Fallback a local si hay error de base de datos (como el FK violation)
            if (error.message.includes('foreign key constraint')) {
                console.warn('Fallo de FK en Supabase, intentando guardado local...');
                return this._buyLocal(userId, product, amount, shares);
            }
            return { success: false, error: error.message };
        }
    },

    /**
     * Vender activo
     */
    async sellAsset(userId, productId, sharesToSell, currentPrice) {
        // Validar si es un UUID (Supabase) o un ID local
        const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (!isConnected || !isUUID(userId)) {
            return this._sellLocal(productId, sharesToSell, currentPrice);
        }

        try {
            // Asegurarnos de que el usuario está realmente autenticado en Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('Sesión de Supabase no encontrada');
            }
            
            const activeUserId = user.id;

            // Obtener el activo
            const { data: asset } = await supabase
                .from('portfolio')
                .select('*')
                .eq('user_id', activeUserId)
                .eq('product_id', productId)
                .single();

            if (!asset) {
                return { success: false, error: 'Activo no encontrado' };
            }

            if (asset.shares < sharesToSell) {
                return { success: false, error: 'Insuficientes acciones' };
            }

            const saleValue = sharesToSell * currentPrice;
            const newShares = asset.shares - sharesToSell;

            if (newShares === 0) {
                // Vender todo - eliminar posición
                const { error } = await supabase
                    .from('portfolio')
                    .delete()
                    .eq('id', asset.id);

                if (error) throw error;
            } else {
                // Reducir posición
                const newValue = asset.invested_value - (sharesToSell * asset.avg_price);

                const { error } = await supabase
                    .from('portfolio')
                    .update({
                        shares: newShares,
                        invested_value: newValue,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', asset.id);

                if (error) throw error;
            }

            // Registrar transacción
            await this._recordTransaction(activeUserId, asset, 'sell', sharesToSell, currentPrice, saleValue);

            return { success: true, saleValue };
        } catch (error) {
            console.error('Error en venta:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Obtener historial de transacciones
     */
    async getTransactions(userId, limit = 50) {
        if (!isConnected) {
            return JSON.parse(localStorage.getItem('invesmate_transactions') || '[]');
        }

        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo transacciones:', error);
            return [];
        }
    },

    /**
     * Suscribirse a cambios en el portfolio (tiempo real)
     */
    subscribe(userId, callback) {
        if (!isConnected) return () => {};

        return supabase
            .channel(`portfolio:${userId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'portfolio',
                filter: `user_id=eq.${userId}`
            }, callback)
            .subscribe();
    },

    // ========================================
    // MÉTODOS LOCALES (FALLBACK)
    // ========================================
    _buyLocal(userId, product, amount, shares) {
        let portfolio = JSON.parse(localStorage.getItem('invesmate_portfolio') || '[]');

        const existing = portfolio.find(p => p.id === product.id);
        if (existing) {
            existing.shares += shares;
            existing.avgPrice = ((existing.shares - shares) * existing.avgPrice + amount) / existing.shares;
            existing.value += amount;
        } else {
            portfolio.push({
                id: product.id,
                name: product.name,
                symbol: product.symbol,
                category: product.category,
                shares,
                avgPrice: product.price,
                value: amount
            });
        }

        localStorage.setItem('invesmate_portfolio', JSON.stringify(portfolio));
        return { success: true, shares };
    },

    _sellLocal(productId, sharesToSell, currentPrice) {
        let portfolio = JSON.parse(localStorage.getItem('invesmate_portfolio') || '[]');
        const assetIndex = portfolio.findIndex(p => p.id === productId);

        if (assetIndex === -1) {
            return { success: false, error: 'Activo no encontrado' };
        }

        const asset = portfolio[assetIndex];
        if (asset.shares < sharesToSell) {
            return { success: false, error: 'Insuficientes acciones' };
        }

        const saleValue = sharesToSell * currentPrice;
        asset.shares -= sharesToSell;
        asset.value = asset.shares * asset.avgPrice;

        if (asset.shares <= 0) {
            portfolio.splice(assetIndex, 1);
        }

        localStorage.setItem('invesmate_portfolio', JSON.stringify(portfolio));
        return { success: true, saleValue };
    },

    async _recordTransaction(userId, product, type, shares, price, total) {
        const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (!isConnected || !isUUID(userId)) {
            const transactions = JSON.parse(localStorage.getItem('invesmate_transactions') || '[]');
            transactions.push({
                id: `tx_${Date.now()}`,
                userId,
                productId: product.id,
                productName: product.name,
                productSymbol: product.symbol,
                type,
                shares,
                pricePerShare: price,
                totalValue: total,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('invesmate_transactions', JSON.stringify(transactions));
            return;
        }

        try {
            await supabase
                .from('transactions')
                .insert({
                    user_id: userId,
                    product_id: product.id,
                    product_name: product.name,
                    product_symbol: product.symbol,
                    transaction_type: type,
                    shares: shares,
                    price_per_share: price,
                    total_value: total
                });
        } catch (error) {
            console.error('Error registrando transacción:', error);
        }
    }
};

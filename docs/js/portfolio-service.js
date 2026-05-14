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
        // Siempre obtener datos locales como base o respaldo
        const localPortfolio = JSON.parse(localStorage.getItem('invesmate_portfolio') || '[]');
        
        if (!isConnected) {
            return localPortfolio;
        }

        try {
            const { data, error } = await supabase
                .from('portfolio')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Si hay datos en Supabase, podemos elegir mostrarlos o combinarlos
            // Por simplicidad y robustez, combinamos los activos locales que no estén en Supabase
            // o simplemente concatenamos si son diferentes proyectos.
            // Aquí optamos por priorizar Supabase pero añadir los locales "pendientes".
            const supabaseData = data || [];
            
            // Filtrar locales que ya existen en Supabase (por product_id)
            const uniqueLocals = localPortfolio.filter(lp => 
                !supabaseData.some(sd => sd.product_id === lp.product_id || sd.product_id == lp.id)
            );

            return [...supabaseData, ...uniqueLocals];
        } catch (error) {
            console.error('Error obteniendo portfolio de Supabase, usando local:', error);
            return localPortfolio;
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
            console.log('Compra: Usando almacenamiento local (ID no UUID o sin conexión)');
            return this._buyLocal(userId, product, amount, shares);
        }

        try {
            // Asegurarnos de que el usuario está realmente autenticado en Supabase
            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError || !authData?.user) {
                console.warn('Sesión de Supabase no válida para compra, usando local');
                return this._buyLocal(userId, product, amount, shares);
            }
            
            const activeUserId = authData.user.id;

            // Verificar si ya tiene este activo
            const { data: existing, error: fetchError } = await supabase
                .from('portfolio')
                .select('*')
                .eq('user_id', activeUserId)
                .eq('product_id', product.id)
                .maybeSingle(); // Usar maybeSingle para evitar errores de 0 filas

            if (existing) {
                // Actualizar posición existente
                const newShares = existing.shares + shares;
                const newAvgPrice = ((existing.shares * (existing.avg_price || 0)) + amount) / newShares;
                const newValue = (existing.invested_value || 0) + amount;

                const { error: updateError } = await supabase
                    .from('portfolio')
                    .update({
                        shares: newShares,
                        avg_price: newAvgPrice,
                        invested_value: newValue,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id);

                if (updateError) throw updateError;
            } else {
                // Crear nueva posición
                const { error: insertError } = await supabase
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

                if (insertError) throw insertError;
            }

            // Registrar transacción
            await this._recordTransaction(activeUserId, product, 'buy', shares, product.price, amount);

            return { success: true, shares };
        } catch (error) {
            console.error('Error detallado en compra:', error);
            
            // Código 23503 es Foreign Key Violation en PostgreSQL
            // También revisamos el mensaje por si acaso
            const isFKError = error.code === '23503' || 
                             (error.message && (error.message.includes('foreign key') || error.message.includes('clave foránea')));

            if (isFKError) {
                console.warn('Fallo de integridad (FK) en Supabase. Guardando localmente para no bloquear al usuario.');
                return this._buyLocal(userId, product, amount, shares);
            }
            
            return { success: false, error: error.message || 'Error en la base de datos' };
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
            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError || !authData?.user) {
                return this._sellLocal(productId, sharesToSell, currentPrice);
            }
            
            const activeUserId = authData.user.id;

            // Obtener el activo
            const { data: asset, error: fetchError } = await supabase
                .from('portfolio')
                .select('*')
                .eq('user_id', activeUserId)
                .eq('product_id', productId)
                .maybeSingle();

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
            const isFKError = error.code === '23503' || 
                             (error.message && (error.message.includes('foreign key') || error.message.includes('clave foránea')));
            
            if (isFKError) {
                return this._sellLocal(productId, sharesToSell, currentPrice);
            }
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

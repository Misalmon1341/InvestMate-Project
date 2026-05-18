/**
 * Servicio de Autenticación con Supabase
 * Maneja registro, login, logout y sesión de usuarios
 */

import { supabase, isConnected } from './supabase-client.js';

export const authService = {
    /**
     * Registrar nuevo usuario
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     * @param {string} username - Nombre de usuario
     */
    async signup(email, password, username) {
        if (!isConnected) {
            // Fallback a localStorage
            return this._signupLocal(email, password, username);
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (error) throw error;

            // El trigger en Supabase creará el perfil automáticamente
            return {
                success: true,
                user: {
                    id: data.user.id,
                    username: username,
                    email: email
                }
            };
        } catch (error) {
            console.error('Error en signup:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Iniciar sesión
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     */
    async login(email, password) {
        if (!isConnected) {
            return this._loginLocal(email, password);
        }

        try {
            // Añadir un timeout de 10 segundos a la autenticación
            const authPromise = supabase.auth.signInWithPassword({
                email,
                password
            });

            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('TIMEOUT')), 10000)
            );

            const { data, error } = await Promise.race([authPromise, timeoutPromise]);

            if (error) throw error;

            if (!data?.user) {
                throw new Error('No se pudo recuperar la información del usuario');
            }

            // Devolver éxito inmediatamente, el perfil se puede cargar después o resolverse aquí
            // Pero no queremos que getUserProfile bloquee si la red va lenta
            const profilePromise = this.getUserProfile(data.user.id).catch(() => null);
            const profile = await Promise.race([
                profilePromise,
                new Promise(resolve => setTimeout(() => resolve(null), 2000)) // Máximo 2s para el perfil
            ]);

            // Cadena de fallback robusta: perfil BD -> metadata -> email -> fallback final
            const resolvedUsername = profile?.username 
                || data.user.user_metadata?.username 
                || data.user.raw_user_meta_data?.username
                || (data.user.email ? data.user.email.split('@')[0] : null)
                || email.split('@')[0]
                || 'Usuario';

            return {
                success: true,
                user: {
                    id: data.user.id,
                    username: resolvedUsername,
                    email: data.user.email || email,
                    balance: profile?.balance || 10000,
                    joinDate: profile?.created_at || data.user.created_at || new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error en login:', error);
            let errorMessage = error.message;
            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión con el servidor ha tardado demasiado. Inténtalo de nuevo.';
            }
            return {
                success: false,
                error: this._mapAuthError({ message: errorMessage })
            };
        }
    },

    /**
     * Cerrar sesión
     */
    async logout() {
        if (!isConnected) {
            localStorage.removeItem('invesmate_current');
            return { success: true };
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error en logout:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    },

    /**
     * Solicitar recuperación de contraseña
     * @param {string} email - Correo electrónico
     */
    async requestPasswordReset(email) {
        if (!isConnected) {
            return { success: false, error: 'En modo local no se puede recuperar la contraseña.' };
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.href.split('#')[0]
            });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error solicitando recuperación:', error);
            return { success: false, error: this._mapAuthError(error) };
        }
    },

    /**
     * Actualizar contraseña
     * @param {string} newPassword - Nueva contraseña
     */
    async updatePassword(newPassword) {
        if (!isConnected) {
            return { success: false, error: 'En modo local no se puede actualizar la contraseña.' };
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error actualizando contraseña:', error);
            return { success: false, error: this._mapAuthError(error) };
        }
    },

    /**
     * Obtener perfil de usuario desde la base de datos
     */
    async getUserProfile(userId) {
        // Obtener balance local específico del usuario
        const balanceKey = userId ? `invesmate_balance_${userId}` : 'invesmate_balance';
        const localBalance = localStorage.getItem(balanceKey) || localStorage.getItem('invesmate_balance');
        
        if (!isConnected) return { id: userId, balance: localBalance ? JSON.parse(localBalance) : 10000 };

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;
            
            // Si no hay perfil en BD, devolver uno básico con el balance local si existe
            if (!data) {
                return { id: userId, balance: localBalance ? JSON.parse(localBalance) : 10000 };
            }

            // Devolver datos de la BD (que es la fuente de verdad principal)
            return data;
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            return { id: userId, balance: localBalance ? JSON.parse(localBalance) : 10000 };
        }
    },

    /**
     * Actualizar balance del usuario
     */
    async updateBalance(userId, newBalance) {
        // Guardar siempre en local con clave específica por usuario
        const balanceKey = userId ? `invesmate_balance_${userId}` : 'invesmate_balance';
        localStorage.setItem(balanceKey, JSON.stringify(newBalance));

        const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (!isConnected || !isUUID(userId)) {
            return { success: true };
        }

        try {
            // Verificar sesión activa
            const { data: authData } = await supabase.auth.getUser();
            const activeUserId = authData?.user ? authData.user.id : userId;

            const { error } = await supabase
                .from('profiles')
                .update({ balance: newBalance })
                .eq('id', activeUserId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error actualizando balance en Supabase:', error);
            return { success: true }; 
        }
    },

    /**
     * Obtener sesión actual
     */
    async getSession() {
        if (!isConnected) {
            const current = localStorage.getItem('invesmate_current');
            return current ? JSON.parse(current) : null;
        }

        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // ========================================
    // MÉTODOS LOCALES (FALLBACK)
    // ========================================
    _signupLocal(email, password, username) {
        const users = JSON.parse(localStorage.getItem('invesmate_users') || '[]');

        if (users.find(u => u.email === email || u.username === username)) {
            return {
                success: false,
                error: 'El usuario o correo ya existe'
            };
        }

        const newUser = {
            id: `local_${Date.now()}`,
            email,
            username,
            password, // En prod real, NUNCA guardar password en claro
            joinDate: new Date().toISOString(),
            balance: 10000
        };

        users.push(newUser);
        localStorage.setItem('invesmate_users', JSON.stringify(users));
        localStorage.setItem('invesmate_current', JSON.stringify(newUser));

        return {
            success: true,
            user: {
                id: newUser.id,
                username: newUser.username,
                balance: newUser.balance,
                joinDate: newUser.joinDate
            }
        };
    },

    _loginLocal(email, password) {
        const users = JSON.parse(localStorage.getItem('invesmate_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return {
                success: false,
                error: 'Credenciales incorrectas'
            };
        }

        localStorage.setItem('invesmate_current', JSON.stringify(user));

        return {
            success: true,
            user: {
                id: user.id,
                username: user.username || user.email.split('@')[0] || 'Usuario',
                email: user.email,
                balance: user.balance || 10000,
                joinDate: user.joinDate || new Date().toISOString()
            }
        };
    },

    _logoutLocal() {
        localStorage.removeItem('invesmate_current');
        return { success: true };
    },

    // Mapear errores de Supabase a mensajes amigables
    _mapAuthError(error) {
        const messages = {
            'Invalid login credentials': 'Usuario o contraseña incorrectos',
            'Email not confirmed': 'Email no confirmado',
            'User already registered': 'El usuario ya está registrado',
            'Weak password': 'Contraseña demasiado débil'
        };

        return messages[error.message] || error.message;
    }
};

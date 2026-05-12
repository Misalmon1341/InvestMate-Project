/**
 * Cliente de Supabase para Invesmate
 * Configuración y utilidades para conexión con Supabase
 */

// Importar desde CDN para uso en navegador
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Valores por defecto (Fallback para cuando no se usa Vite como Live Server)
const FALLBACK_URL = 'https://jkosuqfdpnclnvvekonu.supabase.co';
const FALLBACK_ANON_KEY = 'sb_publishable_CfDAzR5guii0lyX4kBQCGw_6iVErkvX';

let envUrl = undefined;
let envKey = undefined;

try {
    envUrl = import.meta.env?.VITE_SUPABASE_URL;
    envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
} catch (e) {
    // Ignorar error si no estamos en entorno Vite (ej. Live Server normal)
}

const SUPABASE_URL = envUrl || FALLBACK_URL || localStorage.getItem('supabase_url');
const SUPABASE_ANON_KEY = envKey || FALLBACK_ANON_KEY || localStorage.getItem('supabase_anon_key');

// Validar configuración
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase no configurado. Usando localStorage como fallback.');
    console.warn('Para configurar Supabase:');
    console.warn('1. Crea un proyecto en https://supabase.com');
    console.warn('2. Ejecuta el SQL en docs/SUPABASE_SETUP.md');
    console.warn('3. Guarda las credenciales:');
    console.warn('   localStorage.setItem("supabase_url", "https://xxx.supabase.co")');
    console.warn('   localStorage.setItem("supabase_anon_key", "eyJ...")');
}

// Crear cliente de Supabase
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Estado de conexión
export const isConnected = !!supabase;

/**
 * Verificar si el usuario está autenticado
 */
export async function getCurrentUser() {
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
}

/**
 * Escuchar cambios en autenticación
 */
export function onAuthChange(callback) {
    if (!supabase) return null;

    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session?.user);
    });
}

/**
 * Suscribirse a cambios en tiempo real en una tabla
 */
export function subscribeToTable(table, callback, filters = {}) {
    if (!supabase) return null;

    let channel = supabase
        .channel(`public:${table}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: table,
            ...filters
        }, callback)
        .subscribe();

    return () => supabase.removeChannel(channel);
}

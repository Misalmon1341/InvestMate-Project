import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        root: '.',
        publicDir: 'public',
        build: {
            outDir: 'dist',
            assetsDir: 'assets'
        },
        server: {
            port: 3000,
            open: true
        },
        define: {
            'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
            'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
        }
    };
});

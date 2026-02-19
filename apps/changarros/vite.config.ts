import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '../../', '');
    return {
        root: __dirname,
        cacheDir: '../../node_modules/.vite/apps/changarros',
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        // Vite automatically exposes all VITE_* vars — no explicit define() needed.
        // We still expose the Gemini key for the BazaarConcierge AI feature.
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            }
        },
        build: {
            outDir: '../../dist/apps/changarros',
            emptyOutDir: true,
            reportCompressedSize: true,
            commonjsOptions: {
                transformMixedEsModules: true,
            },
        },
    };
});

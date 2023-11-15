import { defineConfig } from 'vitest/config';

function createURL(pathToFile: string) {
    return new URL(pathToFile, import.meta.url).toString();
}

export default defineConfig({
    test: {
        include: ['./tests/**/*.ts'],
        exclude: ['./tests/**/*.d.ts'],
        alias: {
            '@': createURL('./src'),
        },
        setupFiles: ['./setups/index.ts'],
    },
});

import { defineConfig } from 'vitest/config';

function createURL(pathToFile: string) {
    return new URL(pathToFile, import.meta.url).toString();
}

export default defineConfig({
    test: {
        include: ['./tests/**/*.ts'],
        alias: {
            '@': createURL('./src'),
        },
    },
});

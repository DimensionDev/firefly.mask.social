import { defineConfig } from 'vitest/config';

function createURL(pathToFile: string) {
    return new URL(pathToFile, import.meta.url).toString();
}

export default defineConfig({
    test: {
        include: ['./tests/**/*.ts'],
        alias: {
            '@masknet/web3-shared-base': createURL('./src/maskbook/packages/web3-shared/base/src/index.ts'),
            '@': createURL('./src'),
        },
    },
});

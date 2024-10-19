import { NotImplementedError } from '@/constants/error.js';
import { createConnector } from 'wagmi';

interface ConnectorOptions {}

export function createParticleConnector({}: ConnectorOptions) {
    return createConnector(() => {
        throw new NotImplementedError();
    });
}

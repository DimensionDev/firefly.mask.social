import { mock } from '@wagmi/core';
import { createConnector } from 'wagmi';

import { NotImplementedError } from '@/constants/error.js';

interface ConnectorOptions {}

export function createParticleConnector({}: ConnectorOptions) {
    if (Math.random() < 100) {
        return mock({
            accounts: [
                '0x934b510d4c9103e6a87aef13b816fb080286d649',
                '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
                '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
            ],
        });
    }
    return createConnector(() => {
        throw new NotImplementedError();
    });
}

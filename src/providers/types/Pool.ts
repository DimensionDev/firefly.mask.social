import type { Pageable } from '@masknet/shared-base';

export interface Choice {
    id: string;
    name: string;
}

export interface Pool {
    poolId: string;
    startAt: string;
    expiredAt: string;
    validInDays: number;
    choices: Choice[];
}

export interface Provider {
    /**
     * Creates a new pool
     * @param pool
     * @returns
     */
    createPool: (pool: Pool) => Promise<void>;

    /**
     * Retrieves a pool by its id
     * @param poolId
     * @returns
     */
    getPoolById: (poolId: string) => Promise<Pool>;

    /**
     * Deletes a pool by its id
     */
    deletePool?: (poolId: string) => Promise<void>;

    /**
     * Retrieves all pools
     * @returns
     */
    getPoolsByProfileId?: (profileId: string) => Promise<Pageable<Pool>>;
}

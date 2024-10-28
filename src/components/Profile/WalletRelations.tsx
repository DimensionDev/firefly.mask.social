import { useQuery } from '@tanstack/react-query';

import { RelationPlatformIcon } from '@/components/RelationPlatformIcon.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { getRelationPlatformUrl } from '@/helpers/getRelationPlatformUrl.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

export function WalletRelations({ identity }: { identity: FireflyIdentity }) {
    const { source, id } = identity;

    const { data: relations = EMPTY_LIST } = useQuery({
        enabled: source === Source.Wallet,
        queryKey: ['relation', source, id],
        queryFn: async () => {
            if (source !== Source.Wallet || !id) return EMPTY_LIST;
            return FireflyEndpointProvider.getNextIDRelations('ethereum', id);
        },
    });

    return relations?.map((relation) => {
        const url = getRelationPlatformUrl(relation.identity.platform, relation.identity.identity);
        return (
            <Tooltip key={relation.identity.uuid} content={relation.identity.displayName} placement="bottom">
                {url ? (
                    <Link href={url} target="_blank" rel="noreferrer noopener">
                        <RelationPlatformIcon size={24} source={relation.identity.platform} />
                    </Link>
                ) : (
                    <span>
                        <RelationPlatformIcon size={24} source={relation.identity.platform} />
                    </span>
                )}
            </Tooltip>
        );
    });
}

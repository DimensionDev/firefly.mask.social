import { ChainId } from '@masknet/web3-shared-evm';
import { redirect } from 'next/navigation.js';

import type { SourceInURL } from '@/constants/enum.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';

export default function Page({
    params,
    searchParams,
}: {
    params: { address: string };
    searchParams: { source: SourceInURL; chainId: string };
}) {
    const chainId: ChainId | undefined = searchParams.chainId
        ? Number.parseInt(searchParams.chainId as string, 10)
        : undefined;
    return redirect(resolveNftUrl(params.address, { chainId }));
}

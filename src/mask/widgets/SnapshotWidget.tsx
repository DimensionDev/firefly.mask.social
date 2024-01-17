import { t } from '@lingui/macro';
import { Renderer as SnapshotContent } from '@masknet/plugin-snapshot';
import { useMount } from 'react-use';

import { MaskProviders } from '@/components/MaskProviders.js';
import { Providers } from '@/components/Providers.js';
import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import { useActivatedPluginSiteAdaptor } from '@/maskbook/packages/plugin-infra/src/entry-content-script.js';
import { MaskPostExtraInfoWrapper } from '@/maskbook/packages/shared/src/index.js';
import { PluginID } from '@/maskbook/packages/shared-base/src/index.js';

interface SnapshotWidgetProps {
    url: string;
}

export default function SnapshotWidget({ url }: SnapshotWidgetProps) {
    const definition = useActivatedPluginSiteAdaptor.visibility.useAnyMode(PluginID.Snapshot);
    useMount(() => {
        connectMaskWithWagmi();
    });
    if (!definition) return null;
    return (
        <Providers>
            <MaskProviders>
                <MaskPostExtraInfoWrapper
                    ID={definition.ID}
                    wrapperProps={definition.wrapperProps}
                    open
                    title={t`Snapshot`}
                    publisher={<>{t`Mask Network`}</>}
                >
                    <SnapshotContent url={url} />
                </MaskPostExtraInfoWrapper>
            </MaskProviders>
        </Providers>
    );
}

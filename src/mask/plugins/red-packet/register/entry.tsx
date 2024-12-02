import type { Plugin } from '@masknet/plugin-infra';
import { usePluginWrapper } from '@masknet/plugin-infra/content-script';
import { memo } from 'react';

import { RedPacketInjection } from '@/mask/plugins/red-packet/components/RedPacketInjection.js';
import { RedPacketInPost } from '@/mask/plugins/red-packet/components/RedPacketInPost.js';
import {
    RedPacketMetadataReader,
    renderWithRedPacketMetadata,
} from '@/mask/plugins/red-packet/helpers/renderWithRedPacketMetadata.js';
import { base } from '@/mask/plugins/red-packet/register/base.js';

function Render(
    props: React.PropsWithChildren<{
        name: string;
    }>,
) {
    usePluginWrapper(true, { name: props.name });
    return <>{props.children}</>;
}

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    DecryptedInspector: memo(function RedPacketInspector(props) {
        const meta = props.message.meta;

        if (RedPacketMetadataReader(meta).isOk())
            return (
                <Render name="Lucky Drop">
                    {renderWithRedPacketMetadata(meta, (r) => (
                        <RedPacketInPost payload={r} />
                    ))}
                </Render>
            );

        return null;
    }),
    GlobalInjection: RedPacketInjection,
    wrapperProps: {
        icon: null,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(249, 55, 55, 0.2) 100%), #FFFFFF',
    },
};

export default site;

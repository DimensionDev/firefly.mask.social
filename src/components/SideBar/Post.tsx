'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { Trans } from '@lingui/macro';

import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { useCurrentVisitingChannel } from '@/hooks/useCurrentVisitingChannel.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useMounted } from '@/hooks/useMounted.js';
import { ComposeModalRef } from '@/modals/controls.js';

interface PostProps {
    collapsed?: boolean;
}

export function Post({ collapsed = false }: PostProps) {
    const mounted = useMounted();
    const isLogin = useIsLogin();
    const currentChannel = useCurrentVisitingChannel();

    if (!mounted) return null;

    return isLogin ? (
        collapsed ? (
            <li className="text-center">
                <Tooltip content={<Trans>Post</Trans>} placement="right">
                    <ClickableButton
                        className="rounded-full bg-main p-1 text-primaryBottom"
                        onClick={() =>
                            ComposeModalRef.open({
                                type: 'compose',
                                channel: currentChannel,
                            })
                        }
                    >
                        <PlusIcon className="h-5 w-5" aria-hidden="true" />
                    </ClickableButton>
                </Tooltip>
            </li>
        ) : (
            <li>
                <ClickableButton
                    className="mt-6 hidden w-[200px] rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom md:block"
                    onClick={() => {
                        ComposeModalRef.open({
                            type: 'compose',
                            channel: currentChannel,
                        });
                    }}
                >
                    <Trans>Post</Trans>
                </ClickableButton>
            </li>
        )
    ) : null;
}

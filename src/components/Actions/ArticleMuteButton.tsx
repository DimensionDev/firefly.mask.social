import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import { forwardRef } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Article } from '@/providers/types/Article.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    article: Article;
}

export const ArticleMuteButton = forwardRef<HTMLButtonElement, Props>(function ArticleMuteButton(
    { article, ...rest }: Props,
    ref,
) {
    const muted = article.author.isMuted;
    const mutation = useMutation({
        mutationFn: () => {
            if (muted) return FireflySocialMediaProvider.unblockAddress(article.author.id);
            return FireflySocialMediaProvider.blockAddress(article.author.id);
        },
    });
    const loading = mutation.isPending;
    return (
        <MenuButton
            {...rest}
            onClick={async () => {
                const identity = article.author.handle || article.author.id;
                if (!muted) {
                    const confirmed = await ConfirmModalRef.openAndWaitForClose({
                        title: t`Mute ${identity}`,
                        variant: 'normal',
                        content: (
                            <div className="text-main">
                                <Trans>Articles from @{identity} will now be hidden in your home timeline</Trans>
                            </div>
                        ),
                    });
                    if (!confirmed) {
                        rest.onClick?.();
                        return;
                    }
                }
                await mutation.mutateAsync();
                rest.onClick?.();
            }}
            ref={ref}
        >
            {loading ? (
                <LoadingIcon width={16} height={16} className="mx-1 animate-spin" />
            ) : muted ? (
                <SpeakerWaveIcon width={24} height={24} />
            ) : (
                <SpeakerXMarkIcon width={24} height={24} />
            )}
            <span className="font-bold leading-[22px] text-main">
                {muted ? <Trans>Unmute</Trans> : <Trans>Mute</Trans>}
            </span>
        </MenuButton>
    );
});

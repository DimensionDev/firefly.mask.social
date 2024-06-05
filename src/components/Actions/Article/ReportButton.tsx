import { FlagIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import { forwardRef } from 'react';

import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Article } from '@/providers/types/Article.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    article: Article;
    onReport?(profile: Profile): Promise<boolean>;
}

export const ArticleReportButton = forwardRef<HTMLButtonElement, Props>(function ArticleReportButton(
    { article, onReport, ...rest }: Props,
    ref,
) {
    const mutation = useMutation({
        mutationFn: async () => {
            return FireflySocialMediaProvider.reportArticle(article);
        },
    });
    return (
        <MenuButton
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Report Article`,
                    content: (
                        <div className="text-main">
                            <Trans>Are you sure you want to report this article?</Trans>
                        </div>
                    ),
                    variant: 'normal',
                });
                if (!confirmed) return;
                try {
                    await mutation.mutateAsync();
                } catch (error) {
                    enqueueErrorMessage(t`Failed to report @${article.title}`, { error });
                    throw error;
                }
            }}
            ref={ref}
        >
            <FlagIcon width={24} height={24} />
            <span className="font-bold leading-[22px] text-main">
                <Trans>Report Article</Trans>
            </span>
        </MenuButton>
    );
});

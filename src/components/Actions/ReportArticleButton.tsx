import { t, Trans } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import { forwardRef } from 'react';

import FlagIcon from '@/assets/flag.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { Article } from '@/providers/types/Article.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    article: Article;
    onReport?(profile: Profile): Promise<boolean>;
}

export const ReportArticleButton = forwardRef<HTMLButtonElement, Props>(function ReportArticleButton(
    { article, onReport, onClick, ...props }: Props,
    ref,
) {
    const mutation = useMutation({
        mutationFn: async () => {
            return FireflyEndpointProvider.reportArticle(article);
        },
    });
    return (
        <MenuButton
            {...props}
            onClick={async (event) => {
                onClick?.(event);
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Report article`,
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
                    enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to report @${article.title}.`), {
                        error,
                    });
                    throw error;
                }
            }}
            ref={ref}
        >
            <FlagIcon width={18} height={18} />
            <span className="font-bold leading-[22px] text-main">
                <Trans>Report article</Trans>
            </span>
        </MenuButton>
    );
});

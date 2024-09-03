import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolvePollProvider } from '@/helpers/resolvePollProvider.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { PollOption } from '@/providers/types/Poll.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface VoteButtonProps {
    option: PollOption;
    post: Post;
    frameUrl: string;
}

export function VoteButton({ option, post, frameUrl }: VoteButtonProps) {
    const pollId = post.poll?.id;
    const isLogin = useIsLogin(post.source);

    const [{ loading }, handleVote] = useAsyncFn(async () => {
        try {
            if (!isLogin) {
                LoginModalRef.open({ source: post.source });
                return;
            }
            if (!pollId) throw new Error('Poll ID not found');
            const pollProvider = resolvePollProvider(post.source);
            const res = await pollProvider.vote({
                postId: post.postId,
                pollId,
                frameUrl,
                option,
            });
            enqueueSuccessMessage(res.is_success ? t`Voted successfully.` : t`Failed to vote.`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to vote.`), { error });
            throw error;
        }
    }, [post.source, pollId, frameUrl, isLogin]);

    return (
        <div className="mt-3">
            <ClickableButton
                disabled={loading}
                className="flex h-10 w-full items-center justify-center rounded-[10px] border border-lightMain text-base font-bold leading-10 text-lightMain hover:border-lightHighlight hover:text-lightHighlight disabled:!cursor-default disabled:!opacity-100"
                onClick={handleVote}
            >
                {loading ? <LoadingIcon className="animate-spin" width={24} height={24} /> : option.label}
            </ClickableButton>
        </div>
    );
}

import { Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import SendIcon from '@/assets/send.svg';
import { useSendFarcaster } from '@/components/Compose/ComposeSend/useSendFarcaster.js';
import { useSendLens } from '@/components/Compose/ComposeSend/useSendLens.js';
import { CountdownCircle } from '@/components/Compose/CountdownCircle.js';
import { SocialPlatform } from '@/constants/enum.js';
import { MAX_POST_SIZE } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { measureChars } from '@/helpers/readChars.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export default function ComposeSend() {
    const { chars, images, type, video, currentSource, clear, availableSources } = useComposeStateStore();

    const { length, visibleLength, invisibleLength } = measureChars(chars);
    const disabled = (length === 0 || length > MAX_POST_SIZE) && images.length === 0 && !video;
    const sendLens = useSendLens();
    const sendFarcaster = useSendFarcaster();

    const [{ loading }, handleSend] = useAsyncFn(async () => {
        if (!currentSource && type === 'compose') {
            const promises: Array<Promise<void>> = [];
            if (availableSources.includes(SocialPlatform.Lens)) promises.push(sendLens());
            if (availableSources.includes(SocialPlatform.Farcaster)) promises.push(sendFarcaster());

            const result = await Promise.allSettled(promises);
            if (result.some((x) => x.status === 'rejected')) return;
        } else if (currentSource === SocialPlatform.Lens) {
            await sendLens();
        } else if (currentSource === SocialPlatform.Farcaster) {
            await sendFarcaster();
        }
        ComposeModalRef.close();
        clear();
    }, [currentSource, availableSources, type, sendLens, sendFarcaster]);

    return (
        <div className=" flex h-[68px] items-center justify-end gap-4 px-4 shadow-send">
            {visibleLength ? (
                <div className=" flex items-center gap-[10px] whitespace-nowrap text-[15px] text-main">
                    <CountdownCircle count={visibleLength} width={24} height={24} className="flex-shrink-0" />
                    <span className={classNames(disabled ? ' text-danger' : '')}>
                        {visibleLength} / {MAX_POST_SIZE - invisibleLength}
                    </span>
                </div>
            ) : null}

            <button
                disabled={disabled}
                className={classNames(
                    ' flex h-10 w-[120px] items-center justify-center gap-1 rounded-full bg-black text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black',
                )}
                onClick={() => {
                    if (!disabled) {
                        handleSend();
                    }
                }}
            >
                {loading ? (
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                ) : (
                    <>
                        <SendIcon width={18} height={18} className=" text-foreground" />
                        <span>
                            <Trans>Send</Trans>
                        </span>
                    </>
                )}
            </button>
        </div>
    );
}

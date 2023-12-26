import { Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import SendIcon from '@/assets/send.svg';
import { useSendFarcaster } from '@/components/Compose/ComposeSend/useSendFarcaster.js';
import { useSendLens } from '@/components/Compose/ComposeSend/useSendLens.js';
import { CountdownCircle } from '@/components/Compose/CountdownCircle.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export default function ComposeSend() {
    const { chars, images, type, video, source, clear, disabledSources } = useComposeStateStore();

    const charsLength = chars.length;
    const disabled = (charsLength === 0 || charsLength > 280) && images.length === 0 && !video;
    const sendLens = useSendLens();
    const sendFarcaster = useSendFarcaster();

    const [{ loading }, handleSend] = useAsyncFn(async () => {
        if (!source && type === 'compose') {
            const promises: Array<Promise<void>> = [];
            if (!disabledSources.includes(SocialPlatform.Lens)) promises.push(sendLens());
            if (!disabledSources.includes(SocialPlatform.Farcaster)) promises.push(sendFarcaster());

            const result = await Promise.allSettled(promises);
            if (result.some((x) => x.status === 'rejected')) return;
        } else if (source === SocialPlatform.Lens) {
            await sendLens();
        } else if (source === SocialPlatform.Farcaster) {
            await sendFarcaster();
        }
        ComposeModalRef.close();
        clear();
    }, [source, type, sendLens, sendFarcaster, disabledSources]);

    return (
        <div className=" flex h-[68px] items-center justify-end gap-4 px-4 shadow-send">
            {charsLength ? (
                <div className=" flex items-center gap-[10px] whitespace-nowrap text-[15px] text-main">
                    <CountdownCircle count={charsLength} width={24} height={24} className="flex-shrink-0" />
                    <span className={classNames(disabled ? ' text-danger' : '')}>{charsLength} / 280</span>
                </div>
            ) : null}

            <button
                disabled={disabled}
                className={classNames(
                    ' flex h-10 w-[120px] items-center justify-center gap-1 rounded-full bg-black text-[15px] font-bold text-white disabled:cursor-no-drop disabled:opacity-50  dark:bg-white dark:text-black',
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

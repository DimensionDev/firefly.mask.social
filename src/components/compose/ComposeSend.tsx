import { useCallback, useMemo } from 'react';

import type { IImage } from '@/components/compose/index.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import getPostMetaData from '@/helpers/getPostMetaData.js';
import { LensSocialMedia } from '@/providers/lens/SocialMedia.js';
import uploadToArweave from '@/services/uploadToArweave.js';

interface ComposeSendProps {
    characters: string;
    images: IImage[];
    setOpened: (opened: boolean) => void;
}
export default function ComposeSend({ characters, images, setOpened }: ComposeSendProps) {
    const charactersLen = useMemo(() => characters.length, [characters]);

    const disabled = useMemo(() => charactersLen > 280, [charactersLen]);

    const handleSend = useCallback(async () => {
        // const fc = new WarpcastSocialMedia();

        // const session = await fc.createSession();

        // const profile = await fc.getProfileById(session.profileId);

        // console.log('profile', profile);

        const lens = new LensSocialMedia();
        const session = await lens.createSession();
        const profile = await lens.getProfileById(session.profileId);
        console.log('profile', profile);
        const title = `Post by #${profile.profileId}`;
        const metadata = getPostMetaData({
            title,
            content: characters,
            marketplace: {
                name: title,
                description: characters,
            },
        });
        const arweaveId = await uploadToArweave(metadata);
        console.log('metadata', metadata);
        console.log('arweaveId', arweaveId);
        const post = await lens.publishPost({
            postId: metadata.id,
            author: profile,
            metadata: {
                locale: metadata.locale,
                contentURI: `ar://${arweaveId}`,
                content: null,
            },
            source: SocialPlatform.Lens,
        });
        console.log('post', post);
    }, [characters]);

    return (
        <div className=" flex h-[68px] items-center justify-end gap-4 px-4 shadow-send">
            <div className=" flex items-center gap-[10px]">
                {charactersLen >= 0 && charactersLen < 200 && (
                    <Image src="/svg/loading.green.svg" width={24} height={24} alt="loading.green" />
                )}

                {charactersLen >= 200 && charactersLen < 260 && (
                    <Image src="/svg/loading.yellow.svg" width={24} height={24} alt="loading.yellow" />
                )}

                {charactersLen >= 260 && <Image src="/svg/loading.red.svg" width={24} height={24} alt="loading.red" />}

                <span className={classNames(disabled ? ' text-[#FF3545]' : '')}>{charactersLen} / 280</span>
            </div>

            <button
                className={classNames(
                    ' flex h-10 w-[120px] items-center justify-center gap-1 rounded-full bg-[#07101B] text-sm font-bold text-white',
                    disabled ? ' cursor-no-drop opacity-50' : '',
                )}
                onClick={() => {
                    if (!disabled) {
                        handleSend();
                        setOpened(false);
                    }
                }}
            >
                <Image src="/svg/send.svg" width={18} height={18} alt="send" className=" h-[18px] w-[18px]" />
                <span>Send</span>
            </button>
        </div>
    );
}

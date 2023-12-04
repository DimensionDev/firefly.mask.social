import { Popover, Transition } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { useSnackbar } from 'notistack';
import { Fragment } from 'react';

import FarcasterIcon from '@/assets/farcaster.svg';
import LensIcon from '@/assets/lens.svg';
import RadioYesIcon from '@/assets/radio.yes.svg';
import type { IImage } from '@/components/Compose/index.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { LoginModalRef } from '@/modals/controls.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

interface IPostByProps {
    images: IImage[];
}
export default function PostBy({ images }: IPostByProps) {
    const { enqueueSnackbar } = useSnackbar();

    const lensAccounts = useLensStateStore.use.accounts();
    const farcasterAccounts = useFarcasterStateStore.use.accounts();
    const currentLensAccount = useLensStateStore.use.currentAccount();
    const currentFarcasterAccount = useFarcasterStateStore.use.currentAccount();

    return (
        <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 translate-y-1"
        >
            <Popover.Panel className="absolute bottom-full right-0 flex w-[280px] -translate-y-3 flex-col gap-2 rounded-lg bg-bg p-3 shadow-popover">
                {lensAccounts.length > 0 ? (
                    lensAccounts.map((account) => (
                        <Fragment key={account.id}>
                            <div className={classNames(' flex h-[22px] items-center justify-between')}>
                                <div className=" flex items-center gap-2">
                                    <Image src={account.avatar} width={22} height={22} alt="lens" />
                                    <span className={classNames(' text-sm font-bold text-main')}>
                                        @{account.handle || account.id}
                                    </span>
                                </div>
                                {currentLensAccount.id === account.id ? (
                                    <RadioYesIcon width={16} height={16} />
                                ) : (
                                    <button className=" text-blueBottom text-xs font-bold">
                                        <Trans>Switch</Trans>
                                    </button>
                                )}
                            </div>
                            <div className=" h-px bg-line" />
                        </Fragment>
                    ))
                ) : (
                    <Fragment>
                        <div className=" flex h-[22px] cursor-pointer items-center justify-between">
                            <div className=" flex items-center gap-2">
                                <LensIcon width={22} height={22} />
                                <span className={classNames(' text-sm font-bold text-main')}>Lens</span>
                            </div>

                            <button
                                className=" text-blueBottom text-xs font-bold"
                                onClick={() => LoginModalRef.open({})}
                            >
                                <Trans>Log in</Trans>
                            </button>
                        </div>
                        <div className=" h-px bg-line" />
                    </Fragment>
                )}

                {farcasterAccounts.length > 0 ? (
                    farcasterAccounts.map((account, index) => (
                        <Fragment key={account.id}>
                            <div className={classNames(' flex h-[22px] items-center justify-between')}>
                                <div className=" flex items-center gap-2">
                                    <Image
                                        src={account.avatar || '/svg/farcaster.svg'}
                                        width={22}
                                        height={22}
                                        alt="farcaster"
                                    />
                                    <span className={classNames(' text-sm font-bold text-main')}>
                                        @{account.handle || account.id}
                                    </span>
                                </div>
                                {currentFarcasterAccount.id === account.id ? (
                                    <RadioYesIcon width={16} height={16} />
                                ) : (
                                    <button className=" text-blueBottom text-xs font-bold">
                                        <Trans>Switch</Trans>
                                    </button>
                                )}
                            </div>
                            {index !== farcasterAccounts.length - 1 && <div className=" h-px bg-line" />}
                        </Fragment>
                    ))
                ) : (
                    <Fragment>
                        <div className=" flex h-[22px] cursor-pointer items-center justify-between">
                            <div className=" flex items-center gap-2">
                                <FarcasterIcon width={22} height={22} />
                                <span className={classNames(' text-sm font-bold text-main')}>Farcaster</span>
                            </div>

                            <button
                                className=" text-blueBottom text-xs font-bold"
                                onClick={() => {
                                    if (images.length >= 2) {
                                        enqueueSnackbar(t`Select failed: More than 2 images`, {
                                            variant: 'error',
                                        });
                                    } else {
                                        LoginModalRef.open({});
                                    }
                                }}
                            >
                                <Trans>Log in</Trans>
                            </button>
                        </div>
                    </Fragment>
                )}
            </Popover.Panel>
        </Transition>
    );
}

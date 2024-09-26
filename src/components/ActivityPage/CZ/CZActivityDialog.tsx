'use client';

import { Trans } from '@lingui/macro';
import Tippy from '@tippyjs/react/headless';
import React, { useEffect, useState } from 'react';

import QuestionIcon from '@/assets/question.svg';
import { CZActivityClaimSuccessContent } from '@/components/ActivityPage/CZ/CZActivityClaimSuccessDialog.js';
import { CZActivityContext } from '@/components/ActivityPage/CZ/CZActivityContext.js';
import { CZActivityHomePage } from '@/components/ActivityPage/CZ/CZActivityHomePage.js';
import { CZActivityShortRules } from '@/components/ActivityPage/CZ/CZActivityShortRules.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';
import { Image } from '@/esm/Image.js';

interface Props {
    onClose: () => void;
    open: boolean;
}

export function CZActivityDialog({ open, onClose }: Props) {
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (open) setSuccess(false);
    }, [open]);

    return (
        <Modal open={open} onClose={onClose} className="flex-col" disableScrollLock={false} disableDialogClose>
            <div className="relative z-10 mx-auto flex w-[calc(100%-40px)] max-w-[485px] flex-col items-center space-y-6 rounded-[12px] bg-black px-6 pb-6 text-white">
                <Image
                    src="/image/activity/cz/background.webp"
                    alt="background"
                    width={1500}
                    height={1000}
                    className="pointer-events-none absolute left-0 top-0 h-full w-full rounded-[12px] object-cover"
                />
                <div className="relative flex h-6 w-full items-center justify-center">
                    {/* @ts-ignore */}
                    <Tippy
                        duration={0}
                        delay={0}
                        render={() => {
                            return (
                                <div className="flex max-w-[327px] flex-col space-y-3 rounded-[12px] bg-[#181A20] px-6 py-3 text-white">
                                    <CZActivityShortRules />
                                </div>
                            );
                        }}
                    >
                        <button className="absolute left-0 top-0 cursor-pointer">
                            <QuestionIcon width={24} height={24} />
                        </button>
                    </Tippy>
                    <h3 className="font-bold">
                        {success ? <Trans>Share</Trans> : <Trans>Welcome Back CZ Collectible</Trans>}
                    </h3>
                    <CloseButton
                        className="absolute right-0 top-0 h-6 w-6 !p-0 hover:!bg-white/10"
                        iconClassName="!text-white"
                        onClick={onClose}
                    />
                </div>
                <CZActivityContext.Provider
                    value={{
                        onClaim() {
                            setSuccess(true);
                        },
                        goChecklist() {},
                        type: 'dialog',
                    }}
                >
                    {success ? (
                        <CZActivityClaimSuccessContent />
                    ) : (
                        <div className="relative flex flex-col space-y-6">
                            <CZActivityHomePage />
                        </div>
                    )}
                </CZActivityContext.Provider>
            </div>
        </Modal>
    );
}

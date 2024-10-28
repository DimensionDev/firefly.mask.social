'use client';

import { UserPlusIcon } from '@heroicons/react/24/outline';
import { Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { LoginStatusBar } from '@/components/Login/LoginStatusBar.js';
import { classNames } from '@/helpers/classNames.js';
import { useAsyncStatusAll } from '@/hooks/useAsyncStatus.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useMounted } from '@/hooks/useMounted.js';
import { LoginModalRef } from '@/modals/controls.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface FooterProps {
    collapsed?: boolean;
}

export function Footer({ collapsed = false }: FooterProps) {
    const mounted = useMounted();
    const isLogin = useIsLogin();

    const isLoading = useAsyncStatusAll();

    if (!mounted) return;

    return (
        <footer
            className={classNames('absolute -left-2 -right-2 bottom-20', {
                'flex justify-center text-center': !isLogin,
            })}
        >
            {isLogin ? (
                <LoginStatusBar collapsed={collapsed} />
            ) : collapsed ? (
                <ClickableButton
                    onClick={() => {
                        LoginModalRef.open();
                    }}
                    className="rounded-full bg-main p-1 text-primaryBottom"
                >
                    <UserPlusIcon className="h-5 w-5" aria-hidden="true" />
                </ClickableButton>
            ) : (
                <ClickableButton
                    disabled={isLoading}
                    onClick={async () => {
                        useNavigatorState.getState().updateSidebarOpen(false);
                        await delay(300);
                        LoginModalRef.open();
                    }}
                    className="flex w-[200px] items-center justify-center rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom"
                >
                    {isLoading ? (
                        <LoadingIcon className="mr-2 animate-spin" width={24} height={24} />
                    ) : (
                        <Trans>Login</Trans>
                    )}
                </ClickableButton>
            )}
        </footer>
    );
}

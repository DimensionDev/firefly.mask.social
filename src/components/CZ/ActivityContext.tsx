import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { signIn } from 'next-auth/react';
import { createContext, type ReactNode, useCallback, useMemo, useState } from 'react';
import urlcat from 'urlcat';
import { useAccount } from 'wagmi';

import { Source } from '@/constants/enum.js';
import { enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import type { ActivityInfoResponse, WalletProfileResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';
import { Platform, SupportedMethod } from '@/types/bridge.js';

export interface ActivityContextValues {
    onClaim: (hash: string) => void;
    goChecklist: () => void;
    type: 'dialog' | 'page';
    address: string | null;
    setAddress: (address: string | null) => void;
    isLoggedTwitter: boolean;
    onLoginTwitter: () => Promise<void>;
    authToken: string | null;
    setAuthToken: (token: string) => void;
    isLoading: boolean;
    isEnded?: boolean;
}

export const ActivityContext = createContext<ActivityContextValues>({
    onClaim() {},
    goChecklist() {},
    setAddress() {},
    async onLoginTwitter() {},
    type: 'page',
    address: null,
    isLoggedTwitter: false,
    authToken: null,
    setAuthToken() {},
    isLoading: false,
});

export function ActivityContextProvider({
    children,
    value,
}: {
    children: ReactNode;
    value: Omit<
        ActivityContextValues,
        'address' | 'setAddress' | 'isLoggedTwitter' | 'onLoginTwitter' | 'authToken' | 'setAuthToken' | 'isLoading'
    >;
}) {
    const [address, setAddress] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const account = useAccount();
    const twitterProfile = useCurrentProfile(Source.Twitter);
    const {
        data: isLoggedTwitter = false,
        refetch,
        isLoading,
    } = useQuery({
        queryKey: ['is-logged-twitter', !!twitterProfile],
        async queryFn() {
            if (!fireflyBridgeProvider.supported) return !!twitterProfile;
            const token = await fireflyBridgeProvider.request(SupportedMethod.GET_AUTHORIZATION, {});
            if (!token) return false;
            setAuthToken(token);
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/wallet/profile');
            const res = await fetchJSON<WalletProfileResponse>(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.data) return false;
            return res.data.twitterProfiles.length > 0;
        },
    });

    const activityName = 'cz_welcome_back_airdrop'
    const { data: activityInfo, isLoading: ioLoadingActivityInfo } = useQuery({
        queryKey: ['activity-info', activityName],
        async queryFn() {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/activity/info', {
                name: activityName,
            });
            const res = await fetchJSON<ActivityInfoResponse>(url)
            return res.data
        }
    })

    const onLoginTwitter = useCallback(async () => {
        if (fireflyBridgeProvider.supported) {
            const result = await fireflyBridgeProvider.request(SupportedMethod.LOGIN, {
                platform: Platform.TWITTER,
            });
            await refetch();
            if (result) {
                enqueueSuccessMessage(t`Login X`);
            } else {
                enqueueSuccessMessage(t`Login X failed`);
            }
            return;
        }
        await signIn('twitter', {
            redirect: false,
        });
    }, [refetch]);

    const providerValue = useMemo(() => {
        return {
            isLoggedTwitter,
            onLoginTwitter,
            address: address ?? account.address ?? null,
            setAddress,
            authToken,
            setAuthToken,
            isLoading: isLoading || ioLoadingActivityInfo,
            isEnded: activityInfo?.end_time ? dayjs(activityInfo.end_time).isBefore(dayjs()) : undefined,
            ...value,
        };
    }, [value, address, account.address, onLoginTwitter, isLoggedTwitter, authToken, isLoading, ioLoadingActivityInfo]);

    return <ActivityContext.Provider value={providerValue}>{children}</ActivityContext.Provider>;
}

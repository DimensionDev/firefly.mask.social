import { useCallback } from 'react';

import { type Chars } from '@/helpers/chars.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { type Mention, Platform, type RequestArguments, SupportedMethod } from '@/types/bridge.js';

export function useActivityCompose() {
    return useCallback((chars: Chars) => {
        if (fireflyBridgeProvider.supported) {
            const params = Array.isArray(chars)
                ? chars.reduce<Omit<RequestArguments[SupportedMethod.COMPOSE], 'activity'>>(
                      (acc, part) => {
                          if (typeof part === 'string') {
                              acc.text += part;
                          } else {
                              acc.text += part.content;
                              if ('profiles' in part) {
                                  acc.mentions.push({
                                      content: part.content,
                                      profiles: part.profiles.map((profile) => ({
                                          ...profile,
                                          platform: profile.platform as unknown as Platform,
                                      })),
                                  } as Mention);
                              }
                          }
                          return acc;
                      },
                      {
                          text: '',
                          mentions: [],
                      },
                  )
                : { text: chars, mentions: [] };

            fireflyBridgeProvider.request(SupportedMethod.COMPOSE, {
                activity: `${window.location.origin}${window.location.pathname}`,
                ...params,
            });
            return;
        }

        ComposeModalRef.open({
            type: 'compose',
            chars,
        });
    }, []);
}

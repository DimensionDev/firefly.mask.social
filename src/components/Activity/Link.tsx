import type { LinkProps } from 'next/link.js';
import { forwardRef, type HTMLProps, type PropsWithChildren } from 'react';
import urlcat from 'urlcat';

import { Link as RawLink } from '@/esm/Link.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { SupportedMethod } from '@/types/bridge.js';

export const Link = forwardRef<
    HTMLAnchorElement,
    PropsWithChildren<Omit<LinkProps, 'href'>> & Pick<HTMLProps<'a'>, 'className' | 'target'> & { href: string }
>(function Link({ children, ...props }, ref) {
    return (
        <RawLink
            ref={ref}
            {...props}
            data-disable-nprogress
            onClick={
                fireflyBridgeProvider.supported
                    ? (event) => {
                          event.preventDefault();

                          const url = !props.href.startsWith('https')
                              ? urlcat(window.location.origin, props.href)
                              : props.href;
                          fireflyBridgeProvider.request(SupportedMethod.OPEN_URL, {
                              url,
                          });
                      }
                    : props.onClick
            }
        >
            {children}
        </RawLink>
    );
});
// @ts-nocheck
/* eslint-disable */
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
function createProxy(initValue: (key: string) => any) {
    function define(key: string) {
        const value = initValue(key);
        Object.defineProperty(container, key, { value, configurable: true });
        return value;
    }
    const container = {
        __proto__: new Proxy({ __proto__: null }, {
            get(_, key) {
                if (typeof key === "symbol")
                    return undefined;
                return define(key);
            },
        }),
    };
    return new Proxy(container, {
        getPrototypeOf: () => null,
        setPrototypeOf: (_, v) => v === null,
        getOwnPropertyDescriptor: (_, key) => {
            if (typeof key === "symbol")
                return undefined;
            if (!(key in container))
                define(key);
            return Object.getOwnPropertyDescriptor(container, key);
        },
    });
}
export function useCalendarTrans(): {
    /**
      * `Calendar`
      */
    title(): string;
    /**
      * `Highly integrated Web3 news and events on Twitter, providing information on tokens, NFTs, AMAs, and regulatory events.`
      */
    description(): string;
    /**
      * `No content for the last two weeks.`
      */
    empty_status(): string;
    /**
      * `Total`
      */
    total(): string;
    /**
      * `Price`
      */
    price(): string;
    /**
      * `Date`
      */
    date(): string;
    /**
      * `Loading`
      */
    loading(): string;
    /**
      * `Powered By`
      */
    powered_by(): string;
    /**
      * `News`
      */
    news(): string;
    /**
      * `Events`
      */
    event(): string;
    /**
      * `NFTs`
      */
    nfts(): string;
    /**
      * `The content is fully loaded`
      */
    content_end(): string;
    /**
      * `Expired`
      */
    expired(): string;
} { const { t } = useTranslation("io.mask.calendar"); return useMemo(() => createProxy((key) => t.bind(null, key)), [t]); }
